import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { enumerateDates, rangeContainsUnavailableDate } from "./availability";

describe("booking availability", () => {
  test("includes every day in a rental range", () => {
    assert.deepEqual(enumerateDates("2026-10-10", "2026-10-12"), [
      "2026-10-10",
      "2026-10-11",
      "2026-10-12",
    ]);
  });

  test("blocks a range when one confirmed date is unavailable", () => {
    const unavailable = new Set(["2026-10-11"]);
    assert.equal(rangeContainsUnavailableDate("2026-10-10", "2026-10-12", unavailable), true);
  });

  test("allows a range when pending requests have not marked dates unavailable", () => {
    const unavailable = new Set<string>();
    assert.equal(rangeContainsUnavailableDate("2026-10-10", "2026-10-12", unavailable), false);
  });
});