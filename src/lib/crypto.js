import crypto from "crypto";

const key = Buffer.from(process.env.ENCRYPTION_KEY_BASE64, "base64");
if (key.length !== 32)
  throw new Error("ENCRYPTION_KEY_BASE64 must be 32 bytes");

export function encrypt(text) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const enc = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString("base64");
}

export function decrypt(base64) {
  const data = Buffer.from(base64, "base64");
  const iv = data.subarray(0, 12);
  const tag = data.subarray(12, 28);
  const enc = data.subarray(28);
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  const dec = Buffer.concat([decipher.update(enc), decipher.final()]);
  return dec.toString("utf8");
}

export function sha1(text) {
  return crypto.createHash("sha1").update(text).digest("hex");
}
