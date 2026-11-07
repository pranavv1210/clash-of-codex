import { describe, expect, it } from "vitest";
import { decrypt, encrypt } from "../../src/lib/crypto";
describe("crypto", () => {
  it("round trips and randomizes ciphertext", () => {
    const secret = "a".repeat(32),
      a = encrypt("token", secret),
      b = encrypt("token", secret);
    expect(a).not.toBe(b);
    expect(decrypt(a, secret)).toBe("token");
  });
});
