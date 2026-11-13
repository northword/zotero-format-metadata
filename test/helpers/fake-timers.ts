import type { SinonFakeTimers } from "sinon";
import * as sinon from "sinon";

/** `sinon.useFakeTimers()` also takes a number or a date, which we never use. */
type FakeTimersConfig = NonNullable<
  Exclude<Parameters<typeof sinon.useFakeTimers>[0], number | Date>
>;

/**
 * Take over the timers of one window, so a test can drive delays instead of
 * waiting for them in real time.
 *
 * The plugin schedules every delay on the window that shows it — the progress
 * notification closes itself with `window.setTimeout` — which keeps the clock
 * local: the rest of Zotero, and the test runner itself, keep their real
 * timers. `Zotero.Promise.delay()` is therefore still a real delay, and can be
 * used to let the page catch up between two ticks.
 *
 * The clock starts at 0 and must be released with `clock.uninstall()`, in a
 * `finally`; otherwise the window keeps the fake timers for the rest of the run.
 *
 * Sinon is used rather than `@sinonjs/fake-timers` on its own because the specs
 * are bundled with esbuild for the browser: sinon's prebuilt ESM entry, which
 * esbuild picks, inlines the node `util` polyfill its timers ask for, while the
 * standalone package lists only `timers/promises` in its `browser` field and
 * leaves esbuild unable to resolve the `util` import.
 *
 * @example
 * ```ts
 * const clock = useFakeTimersOn(win);
 * try {
 *   await clock.tickAsync(CLOSE_DELAY);
 *   assert.isTrue(win.closed);
 * }
 * finally {
 *   clock.uninstall();
 * }
 * ```
 */
export function useFakeTimersOn(win: Window): SinonFakeTimers {
  // `global` is what points the clock at one window instead of the test runner.
  // Sinon supports it, but it is missing from the typings.
  const config: FakeTimersConfig & { global: Window } = {
    global: win,
    toFake: ["setTimeout", "clearTimeout"],
    // A timer scheduled before the clock was installed is a real one, and the
    // code under test may still cancel it: forward those calls to the native
    // implementation instead of letting the fake timers only warn about them.
    shouldClearNativeTimers: true,
  };

  return sinon.useFakeTimers(config);
}
