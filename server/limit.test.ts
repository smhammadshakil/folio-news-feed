import { describe, expect, it } from "vitest";
import { allowSearch, clearSearchLimits } from "./limit.js";

describe("allowSearch", () => {
  it("allows a short burst and then asks the caller to wait", () => {
    clearSearchLimits();
    for (let i = 0; i < 30; i += 1) expect(allowSearch("reader", 1_000)).toBe(true);
    expect(allowSearch("reader", 1_000)).toBe(false);
    expect(allowSearch("reader", 61_000)).toBe(true);
  });
});
