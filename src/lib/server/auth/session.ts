import { createHmac, timingSafeEqual } from "node:crypto";

export type SessionPayload = {
  userId: string;
  issuedAt: number;
};

export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days
const SESSION_TTL_MS = SESSION_MAX_AGE_SECONDS * 1000;

const encode = (value: string | Buffer) => Buffer.from(value).toString("base64url");
const decode = (value: string) => Buffer.from(value, "base64url");

const sign = (value: string, secret: string) =>
  createHmac("sha256", secret).update(value).digest();

export const createSessionToken = (payload: SessionPayload, secret: string) => {
  const encodedPayload = encode(JSON.stringify(payload));
  const signature = encode(sign(encodedPayload, secret));
  return `${encodedPayload}.${signature}`;
};

export const parseSessionToken = (token: string | undefined, secret: string): SessionPayload | null => {
  if (!token)
    return null;

  try {
    const [encodedPayload, encodedSignature] = token.split(".");
    if (!encodedPayload || !encodedSignature)
      return null;

    const expectedSignature = sign(encodedPayload, secret);
    const providedSignature = decode(encodedSignature);
    if (expectedSignature.length !== providedSignature.length)
      return null;

    if (!timingSafeEqual(expectedSignature, providedSignature))
      return null;

    const payload = JSON.parse(decode(encodedPayload).toString("utf8")) as SessionPayload;
    if (typeof payload?.userId !== "string" || typeof payload?.issuedAt !== "number")
      return null;

    if (Date.now() - payload.issuedAt > SESSION_TTL_MS)
      return null;

    return payload;
  } catch {
    return null;
  }
};
