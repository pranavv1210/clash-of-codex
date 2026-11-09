import { describe, expect, it } from "vitest";
import { canAccessProductionShowroom } from "../../src/lib/showroom-access";

describe("production showroom access", () => {
  it("allows the configured GitHub owner", () =>
    expect(canAccessProductionShowroom("PranavV1210", "pranavv1210")).toBe(
      true,
    ));
  it("returns false for another user", () =>
    expect(canAccessProductionShowroom("someone-else", "pranavv1210")).toBe(
      false,
    ));
  it("returns false when logged out", () =>
    expect(canAccessProductionShowroom(null, "pranavv1210")).toBe(false));
});
