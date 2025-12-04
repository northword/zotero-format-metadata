import pThrottle from "p-throttle";
import { getPref } from "./prefs";

/**
 * Apply throttle to a function if cooldown is specified and greater than 0.
 * Supports both required and optional functions through function overloading.
 *
 * @param fn - The function to throttle (required or optional)
 * @param cooldown - Cooldown interval in milliseconds
 * @returns The throttled function, or original function if no cooldown
 */
export function withThrottle<T extends (...args: any[]) => any>(
  fn: T,
  cooldown?: number,
): T;
export function withThrottle<T extends (...args: any[]) => any>(
  fn: T | undefined,
  cooldown?: number,
): T | undefined;
export function withThrottle<T extends (...args: any[]) => any>(
  fn: T | undefined,
  cooldown: number = 0,
): T | undefined {
  if (!fn || cooldown <= 0) {
    return fn;
  }

  const numConcurrent = getPref("lint.numConcurrent") || 1;

  const throttled = pThrottle({
    limit: Math.min(Math.floor(10000 / cooldown), numConcurrent),
    interval: cooldown,
  });

  return throttled(fn);
}
