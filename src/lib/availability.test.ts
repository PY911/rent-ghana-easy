import { describe, expect, test } from "bun:test";
import { enumerateDates, rangeContainsUnavailableDate } from "./availability";

describe("booking availability", () => {
  test("includes every day in a rental range", () => {
    expect(enumerateDates("2026-10-10", "2026-10-12")).toEqual([
      "2026-10-10",
      "2026-10-11",
      "2026-10-12",
    ]);
  });

  test("blocks a range when one confirmed date is unavailable", () => {
    const unavailable = new Set(["2026-10-11"]);
    expect(rangeContainsUnavailableDate("2026-10-10", "2026-10-12", unavailable)).toBe(true);
  });

  test("allows a range when pending requests have not marked dates unavailable", () => {
    const unavailable = new Set<string>();
    expect(rangeContainsUnavailableDate("2026-10-10", "2026-10-12", unavailable)).toBe(false);
  });
});