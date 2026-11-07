import { afterEach, describe, expect, it } from "vitest";
import { serverEnv } from "../../src/lib/env";
const saved = { ...process.env };
afterEach(() => {
  process.env = { ...saved };
});
describe("environment", () => {
  it("rejects missing secrets", () => {
    delete process.env.GITHUB_CLIENT_ID;
    expect(() => serverEnv()).toThrow("GITHUB_CLIENT_ID");
  });
  it("accepts valid server config", () => {
    Object.assign(process.env, {
      GITHUB_CLIENT_ID: "id",
      GITHUB_CLIENT_SECRET: "secret",
      SESSION_SECRET: "x".repeat(32),
    });
    expect(serverEnv().GITHUB_CLIENT_ID).toBe("id");
  });
});
