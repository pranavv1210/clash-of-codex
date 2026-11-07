import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";
function key(secret: string) {
  return createHash("sha256").update(secret).digest();
}
export function encrypt(value: string, secret: string) {
  const iv = randomBytes(12),
    cipher = createCipheriv("aes-256-gcm", key(secret), iv),
    data = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), data]).toString("base64url");
}
export function decrypt(value: string, secret: string) {
  const raw = Buffer.from(value, "base64url"),
    d = createDecipheriv("aes-256-gcm", key(secret), raw.subarray(0, 12));
  d.setAuthTag(raw.subarray(12, 28));
  return Buffer.concat([d.update(raw.subarray(28)), d.final()]).toString(
    "utf8",
  );
}
