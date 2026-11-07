import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { pkceChallenge, requireCsrf, safeEqual } from "../../src/lib/security";
describe("request security", () => {
  it("creates an RFC7636 S256 challenge", () => {
    expect(pkceChallenge("a".repeat(43))).toMatch(/^[A-Za-z0-9_-]{43}$/);
  });
  it("uses constant-safe equality semantics", () => {
    expect(safeEqual("same", "same")).toBe(true);
    expect(safeEqual("a", "b")).toBe(false);
  });
  it("rejects a cross-origin POST", async () => {
    const req = new NextRequest("https://app.example/api/repos/select", {
      method: "POST",
      headers: {
        origin: "https://evil.example",
        "x-csrf-token": "token",
        cookie: "coc_csrf=token",
      },
    });
    const response = await requireCsrf(req);
    expect(response?.status).toBe(403);
  });
  it("accepts matching same-origin double-submit tokens", async () => {
    const req = new NextRequest("https://app.example/api/repos/select", {
      method: "POST",
      headers: {
        origin: "https://app.example",
        "x-csrf-token": "token",
        cookie: "coc_csrf=token",
      },
    });
    expect(await requireCsrf(req)).toBeNull();
  });
});
