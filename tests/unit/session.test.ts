import { describe, expect, it } from "vitest";
import { digest, isExpired, shouldRefresh } from "../../src/lib/session";
describe("session policy", () => {
  const now = new Date("2026-11-07T12:00:00Z");
  it("recognizes expiry", () => {
    expect(isExpired(new Date("2026-11-07T11:59:59Z"), now)).toBe(true);
    expect(isExpired(new Date("2026-11-07T12:00:01Z"), now)).toBe(false);
  });
  it("renews no more than hourly", () => {
    expect(shouldRefresh(new Date("2026-11-07T10:59:59Z"), now)).toBe(true);
    expect(shouldRefresh(new Date("2026-11-07T11:30:00Z"), now)).toBe(false);
  });
  it("hashes opaque ids", () => expect(digest("session")).toHaveLength(64));
});
