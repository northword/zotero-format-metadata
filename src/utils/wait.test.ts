import { describe, expect, it } from "vitest";
import { timeoutPromise } from "./wait";

describe("timeoutPromise", () => {
  it("resolves with the value if the promise settles in time", async () => {
    await expect(timeoutPromise(Promise.resolve("done"), 50)).resolves.toBe("done");
  });

  it("rejects once the timeout is reached", async () => {
    const never = new Promise<string>(() => {});
    await expect(timeoutPromise(never, 10)).rejects.toThrow("Timeout");
  });

  it("rejects with the given message", async () => {
    const never = new Promise<string>(() => {});
    await expect(timeoutPromise(never, 10, "Rule timed out")).rejects.toThrow("Rule timed out");
  });

  it("does not modify the original promise", async () => {
    const promise = new Promise<string>((resolve) => {
      setTimeout(resolve, 20, "late");
    });
    await expect(timeoutPromise(promise, 10)).rejects.toThrow("Timeout");
    // The original promise still settles on its own.
    await expect(promise).resolves.toBe("late");
  });
});
