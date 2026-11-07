import { beforeEach, describe, expect, it, vi } from "vitest";
const query = vi.fn();
vi.mock("../../src/lib/db", () => ({ db: () => ({ query }) }));
import { rateLimit } from "../../src/lib/security";
describe("rate limiting", () => {
  beforeEach(() => query.mockReset());
  it("allows requests within the limit", async () => {
    query.mockResolvedValue({
      rows: [{ count: 2, reset_at: new Date(Date.now() + 60000) }],
    });
    expect(await rateLimit("ip", 3, 60)).toBeNull();
  });
  it("returns 429 and Retry-After over the limit", async () => {
    query.mockResolvedValue({
      rows: [{ count: 4, reset_at: new Date(Date.now() + 60000) }],
    });
    const response = await rateLimit("ip", 3, 60);
    expect(response?.status).toBe(429);
    expect(Number(response?.headers.get("Retry-After"))).toBeGreaterThan(0);
  });
});
