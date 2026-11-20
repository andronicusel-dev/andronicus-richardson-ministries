import { cache } from "react";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { and, count, eq, gt, lt } from "drizzle-orm";
import { db } from "@/db";
import { admins, sessions } from "@/db/schema";

const COOKIE_NAME = "aerm_session";
const SESSION_DAYS = 30;

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const expected = Buffer.from(hash, "hex");
  const actual = scryptSync(password, salt, expected.length);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

/**
 * Over HTTPS the cookie is Secure + partitioned so sign-in also works when the site is
 * shown inside an embedded preview frame. Over plain HTTP (local use) it falls back to Lax.
 */
async function cookieOptions() {
  const h = await headers();
  const proto = (h.get("x-forwarded-proto") ?? "").split(",")[0].trim();
  if (proto === "https") {
    return { httpOnly: true, path: "/", secure: true, sameSite: "none" as const, partitioned: true };
  }
  return { httpOnly: true, path: "/", sameSite: "lax" as const };
}

export async function createSession(adminId: number): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await db.delete(sessions).where(lt(sessions.expiresAt, new Date()));
  await db.insert(sessions).values({ tokenHash: sha256(token), adminId, expiresAt });
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, { ...(await cookieOptions()), maxAge: SESSION_DAYS * 24 * 60 * 60 });
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (token) await db.delete(sessions).where(eq(sessions.tokenHash, sha256(token)));
  jar.set(COOKIE_NAME, "", { ...(await cookieOptions()), maxAge: 0 });
}

export const getAdmin = cache(async (): Promise<{ id: number; email: string } | null> => {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const rows = await db
    .select({ id: admins.id, email: admins.email })
    .from(sessions)
    .innerJoin(admins, eq(sessions.adminId, admins.id))
    .where(and(eq(sessions.tokenHash, sha256(token)), gt(sessions.expiresAt, new Date())))
    .limit(1);
  return rows[0] ?? null;
});

export async function adminExists(): Promise<boolean> {
  const [row] = await db.select({ n: count() }).from(admins);
  return (row?.n ?? 0) > 0;
}

/** For pages: sends visitors who are not signed in to the sign-in (or first-time setup) page. */
export async function requireAdmin(): Promise<{ id: number; email: string }> {
  const admin = await getAdmin();
  if (admin) return admin;
  redirect((await adminExists()) ? "/admin/login" : "/admin/setup");
}
