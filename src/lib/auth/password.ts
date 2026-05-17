import { scryptSync, randomBytes, timingSafeEqual } from "node:crypto";

// Seed accounts use a `plain$<password>` marker so demo logins are
// readable in the seed file. Real signups are always scrypt-hashed.
const PLAIN_PREFIX = "plain$";

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const dk = scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${dk}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  if (stored.startsWith(PLAIN_PREFIX)) {
    const expected = stored.slice(PLAIN_PREFIX.length);
    if (expected.length !== password.length) return false;
    return timingSafeEqual(Buffer.from(expected), Buffer.from(password));
  }
  const [scheme, salt, dk] = stored.split("$");
  if (scheme !== "scrypt" || !salt || !dk) return false;
  const calc = scryptSync(password, salt, 64);
  const want = Buffer.from(dk, "hex");
  if (calc.length !== want.length) return false;
  return timingSafeEqual(calc, want);
}
