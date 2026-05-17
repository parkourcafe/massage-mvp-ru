import { beforeEach, describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import {
  __resetStore,
  createUser,
  findUserByEmail,
  getOwnerProfile,
  getUserById,
} from "@/lib/db";

beforeEach(() => __resetStore());

describe("password hashing", () => {
  it("scrypt-hashes and verifies real passwords", () => {
    const h = hashPassword("s3cret-pass");
    expect(h.startsWith("scrypt$")).toBe(true);
    expect(verifyPassword("s3cret-pass", h)).toBe(true);
    expect(verifyPassword("wrong", h)).toBe(false);
  });

  it("supports the plain$ seed marker", () => {
    expect(verifyPassword("demo1234", "plain$demo1234")).toBe(true);
    expect(verifyPassword("nope", "plain$demo1234")).toBe(false);
  });
});

describe("users & signup", () => {
  it("seeds demo + admin accounts", () => {
    const demo = findUserByEmail("demo@massage.ru");
    expect(demo?.role).toBe("therapist");
    expect(demo?.id).toBe("user-anna");
    expect(findUserByEmail("admin@massage.ru")?.role).toBe("admin");
  });

  it("signup creates a therapist user with an owned draft profile", () => {
    const res = createUser("new@massage.ru", "longpass123", "Иван Петров");
    expect("user" in res).toBe(true);
    if (!("user" in res)) return;
    expect(res.user.role).toBe("therapist");
    expect(verifyPassword("longpass123", res.user.password_hash)).toBe(true);
    expect(res.profile.is_published).toBe(false);
    expect(res.profile.user_id).toBe(res.user.id);
    // Resolvable as that user's owner profile.
    expect(getOwnerProfile(res.user.id).id).toBe(res.profile.id);
    expect(getUserById(res.user.id)?.email).toBe("new@massage.ru");
  });

  it("rejects duplicate email", () => {
    const r = createUser("demo@massage.ru", "longpass123", "Dup");
    expect("error" in r).toBe(true);
  });

  it("getOwnerProfile falls back to the demo profile without a session", () => {
    expect(getOwnerProfile().user_id).toBe("user-anna");
  });
});
