import { hash, verify } from "@node-rs/argon2";
import type { Algorithm } from "@node-rs/argon2";

const opts = {
  algorithm: 2 as Algorithm,
  memoryCost: 65536,
  timeCost: 3,
  parallelism: 1,
};

export async function hashKey(plaintext: string): Promise<string> {
  return hash(plaintext, opts);
}

export async function verifyKey(stored: string, plaintext: string): Promise<boolean> {
  try {
    return await verify(stored, plaintext);
  } catch {
    return false;
  }
}
