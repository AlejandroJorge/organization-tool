import { randomBytes, scrypt as nodeScrypt, timingSafeEqual } from "node:crypto";

const SCRYPT_KEYLEN = 64;

const scrypt = (password: string, salt: Buffer): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    nodeScrypt(password, salt, SCRYPT_KEYLEN, (error, derivedKey) => {
      if (error)
        reject(error);
      else
        resolve(derivedKey as Buffer);
    });
  });

export const hashPassword = async (password: string): Promise<string> => {
  const salt = randomBytes(16);
  const hashed = await scrypt(password, salt);
  return `${salt.toString("hex")}:${hashed.toString("hex")}`;
};

export const verifyPassword = async (password: string, storedHash: string): Promise<boolean> => {
  const [saltHex, hashHex] = storedHash.split(":");
  if (!saltHex || !hashHex)
    return false;

  const salt = Buffer.from(saltHex, "hex");
  const expected = Buffer.from(hashHex, "hex");
  const actual = await scrypt(password, salt);

  if (expected.length !== actual.length)
    return false;

  return timingSafeEqual(expected, actual);
};
