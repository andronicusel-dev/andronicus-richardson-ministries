"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { count, eq, max, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  admins,
  contactMessages,
  events,
  galleryPhotos,
  prayerRequests,
  sermons,
  serviceTimes,
  sessions,
  siteImages,
  siteSettings,
} from "@/db/schema";
import {
  adminExists,
  createSession,
  destroySession,
  getAdmin,
  hashPassword,
  verifyPassword,
} from "@/lib/auth";
import { allow, clientIp } from "@/lib/rate-limit";
import sharp from "sharp";
import { ensurePictureTables } from "@/lib/data";
import { IMAGE_KEYS } from "@/lib/format";
import { EMAIL_RE, cleanUrl, field, idOf, isISODate, type FormState } from "@/lib/validate";

const MIN_PASSWORD = 10;

/** Every admin action calls this first: server actions are reachable without visiting a page. */
async function guard() {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

function refresh() {
  revalidatePath("/", "layout");
}

function fail(message: string, errors?: Record<string, string>): FormState {
  return { ok: false, message, errors };
}

/* ───────────────────────── Account ───────────────────────── */

export async function setupAdmin(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = field(formData, "email", 200).toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!EMAIL_RE.test(email)) return fail("Enter the email address you want to sign in with.");
  if (password.length < MIN_PASSWORD) return fail(`Choose a password with at least ${MIN_PASSWORD} characters.`);
  if (password !== confirm) return fail("The two passwords do not match. Please type them again.");

  const created = await db.transaction(async (tx) => {
    // Serialise first-time setup so only one account can ever be created this way.
    await tx.execute(sql`select pg_advisory_xact_lock(72700116)`);
    const [existing] = await tx.select({ n: count() }).from(admins);
    if ((existing?.n ?? 0) > 0) return null;
    const [row] = await tx
      .insert(admins)
      .values({ email, passwordHash: hashPassword(password) })
      .returning({ id: admins.id });
    return row;
  });

  if (!created) redirect("/admin/login");
  await createSession(created.id);
  redirect("/admin");
}

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  if (!(await adminExists())) redirect("/admin/setup");

  const email = field(formData, "email", 200).toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return fail("Enter your email address and password.");

  if (!allow(`login:${await clientIp()}`, 8, 15 * 60_000)) {
    return fail("Too many sign-in attempts. Please wait 15 minutes and try again.");
  }

  const [admin] = await db.select().from(admins).where(eq(admins.email, email)).limit(1);
  const valid = admin ? verifyPassword(password, admin.passwordHash) : false;
  if (!admin || !valid) return fail("That email and password do not match. Please try again.");

  await createSession(admin.id);
  redirect("/admin");
}

export async function logout(): Promise<void> {
  await destroySession();
  redirect("/admin/login");
}

export async function changePassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await guard();
  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  const [row] = await db.select().from(admins).where(eq(admins.id, admin.id)).limit(1);
  if (!row || !verifyPassword(current, row.passwordHash)) return fail("Your current password is not correct.");
  if (next.length < MIN_PASSWORD) return fail(`Choose a new password with at least ${MIN_PASSWORD} characters.`);
  if (next !== confirm) return fail("The two new passwords do not match. Please type them again.");

  await db.update(admins).set({ passwordHash: hashPassword(next) }).where(eq(admins.id, admin.id));
  // Sign out every other device, then keep this one signed in.
  await db.delete(sessions).where(eq(sessions.adminId, admin.id));
  await createSession(admin.id);
  return { ok: true, message: "Password changed. Other devices have been signed out." };
}

/* ───────────────────────── Site details ───────────────────────── */

export async function saveSettings(_prev: FormState, formData: FormData): Promise<FormState> {
  await guard();

  const email = field(formData, "email", 200);
  if (email && !EMAIL_RE.test(email)) return fail("The contact email address does not look right.");

  const links = {
    givingUrl: cleanUrl(field(formData, "givingUrl", 500)),
    facebookUrl: cleanUrl(field(formData, "facebookUrl", 500)),
    youtubeUrl: cleanUrl(field(formData, "youtubeUrl", 500)),
    instagramUrl: cleanUrl(field(formData, "instagramUrl", 500)),
  };
  const labels: Record<keyof typeof links, string> = {
    givingUrl: "online giving link",
    facebookUrl: "Facebook link",
    youtubeUrl: "YouTube link",
    instagramUrl: "Instagram link",
  };
  for (const key of Object.keys(links) as (keyof typeof links)[]) {
    if (links[key] === null) {
      return fail(`The ${labels[key]} is not a web address. It should look like "example.com/your-page".`);
    }
  }

  const tagline = field(formData, "tagline", 200);
  const welcomeHeading = field(formData, "welcomeHeading", 120);
  if (!tagline || !welcomeHeading) return fail("The home page tagline and welcome heading cannot be empty.");

  await db
    .update(siteSettings)
    .set({
      tagline,
      welcomeHeading,
      welcomeBody: field(formData, "welcomeBody", 3000),
      aboutBody: field(formData, "aboutBody", 8000),
      leaderName: field(formData, "leaderName", 120),
      leaderTitle: field(formData, "leaderTitle", 120),
      leaderBio: field(formData, "leaderBio", 4000),
      address: field(formData, "address", 200),
      cityStateZip: field(formData, "cityStateZip", 200),
      phone: field(formData, "phone", 40),
      phone2: field(formData, "phone2", 40),
      email,
      givingUrl: links.givingUrl ?? "",
      givingNote: field(formData, "givingNote", 1500),
      facebookUrl: links.facebookUrl ?? "",
      youtubeUrl: links.youtubeUrl ?? "",
      instagramUrl: links.instagramUrl ?? "",
      updatedAt: new Date(),
    })
    .where(eq(siteSettings.id, 1));

  refresh();
  return { ok: true, message: "Saved. Your site is updated." };
}

/* ───────────────────────── Service times ───────────────────────── */

export async function saveServiceTime(_prev: FormState, formData: FormData): Promise<FormState> {
  await guard();
  const id = idOf(formData);
  const name = field(formData, "name", 120);
  const day = field(formData, "day", 80);
  const time = field(formData, "time", 80);
  const note = field(formData, "note", 200);
  if (!name || !day || !time) return fail("Add a name, a day and a time.");

  if (id) {
    const order = Number(formData.get("sortOrder"));
    await db
      .update(serviceTimes)
      .set({ name, day, time, note, isSample: false, ...(Number.isFinite(order) ? { sortOrder: Math.trunc(order) } : {}) })
      .where(eq(serviceTimes.id, id));
  } else {
    const [last] = await db.select({ value: max(serviceTimes.sortOrder) }).from(serviceTimes);
    await db.insert(serviceTimes).values({ name, day, time, note, sortOrder: (last?.value ?? 0) + 1 });
  }

  refresh();
  return { ok: true, message: id ? "Saved." : "Added to your site." };
}

export async function deleteServiceTime(formData: FormData): Promise<void> {
  await guard();
  const id = idOf(formData);
  if (id) await db.delete(serviceTimes).where(eq(serviceTimes.id, id));
  refresh();
}

/* ───────────────────────── Sermons ───────────────────────── */

export async function saveSermon(_prev: FormState, formData: FormData): Promise<FormState> {
  await guard();
  const id = idOf(formData);
  const title = field(formData, "title", 200);
  const preachedOn = field(formData, "preachedOn", 10);
  const videoUrl = cleanUrl(field(formData, "videoUrl", 500));
  if (!title) return fail("Give the sermon a title.");
  if (!isISODate(preachedOn)) return fail("Choose the date the sermon was preached.");
  if (videoUrl === null) return fail("The video link is not a web address. Paste the link from YouTube or Facebook.");

  const values = {
    title,
    preachedOn,
    speaker: field(formData, "speaker", 120),
    scripture: field(formData, "scripture", 120),
    summary: field(formData, "summary", 8000),
    videoUrl,
    isSample: false,
  };

  if (id) await db.update(sermons).set(values).where(eq(sermons.id, id));
  else await db.insert(sermons).values(values);

  refresh();
  return { ok: true, message: id ? "Saved." : "Sermon posted to your site." };
}

export async function deleteSermon(formData: FormData): Promise<void> {
  await guard();
  const id = idOf(formData);
  if (id) await db.delete(sermons).where(eq(sermons.id, id));
  refresh();
}

/* ───────────────────────── Events ───────────────────────── */

export async function saveEvent(_prev: FormState, formData: FormData): Promise<FormState> {
  await guard();
  const id = idOf(formData);
  const title = field(formData, "title", 200);
  const eventDate = field(formData, "eventDate", 10);
  if (!title) return fail("Give the event a name.");
  if (!isISODate(eventDate)) return fail("Choose the date of the event.");

  const values = {
    title,
    eventDate,
    timeText: field(formData, "timeText", 80),
    location: field(formData, "location", 200),
    description: field(formData, "description", 4000),
    isSample: false,
  };

  if (id) await db.update(events).set(values).where(eq(events.id, id));
  else await db.insert(events).values(values);

  refresh();
  return { ok: true, message: id ? "Saved." : "Event added to your site." };
}

export async function deleteEvent(formData: FormData): Promise<void> {
  await guard();
  const id = idOf(formData);
  if (id) await db.delete(events).where(eq(events.id, id));
  refresh();
}

/* ───────────────────────── Inbox ───────────────────────── */

export async function setPrayerStatus(formData: FormData): Promise<void> {
  await guard();
  const id = idOf(formData);
  const status = formData.get("status") === "prayed" ? "prayed" : "new";
  if (id) await db.update(prayerRequests).set({ status }).where(eq(prayerRequests.id, id));
  refresh();
}

export async function deletePrayerRequest(formData: FormData): Promise<void> {
  await guard();
  const id = idOf(formData);
  if (id) await db.delete(prayerRequests).where(eq(prayerRequests.id, id));
  refresh();
}

export async function setMessageRead(formData: FormData): Promise<void> {
  await guard();
  const id = idOf(formData);
  const isRead = formData.get("read") === "true";
  if (id) await db.update(contactMessages).set({ isRead }).where(eq(contactMessages.id, id));
  refresh();
}

export async function deleteMessage(formData: FormData): Promise<void> {
  await guard();
  const id = idOf(formData);
  if (id) await db.delete(contactMessages).where(eq(contactMessages.id, id));
  refresh();
}

/* ───────────────────────── Pictures & logo ───────────────────────── */

// Any picture format is welcome: JPG, PNG, WebP, GIF, BMP, TIFF, HEIC/HEIF (iPhone),
// AVIF and SVG. Everything is translated to WebP on the server, so the site can show it.
const IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/bmp",
  "image/tiff",
  "image/heic",
  "image/heif",
  "image/avif",
  "image/svg+xml",
];
// Types a browser can show on its own, kept as-is when conversion is not possible.
const BROWSER_READY = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/bmp", "image/avif", "image/svg+xml"];
const MAX_UPLOAD_BYTES = 10_000_000;

function imageKeyOf(formData: FormData): string {
  const key = field(formData, "key", 20);
  return (IMAGE_KEYS as readonly string[]).includes(key) ? key : "";
}

/**
 * Reads a picture from an upload form and translates it into a web-friendly WebP file,
 * shrunk to at most 2000 px across so it loads quickly on phones. Returns either the
 * stored picture or a plain-language problem the visitor can act on.
 */
async function readImageFile(
  formData: FormData,
): Promise<{ data: string; contentType: string } | { problem: string }> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { problem: "Choose a picture file first." };
  if (file.size > MAX_UPLOAD_BYTES) {
    return { problem: "That file is bigger than 10 MB. Send a smaller picture, or shrink it on your phone first." };
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const type = file.type || "application/octet-stream";

  // Translate the picture into WebP (this also shrinks big phone photos).
  try {
    const converted = await sharp(bytes, { animated: false })
      .rotate() // respect how the photo was taken (phone orientation)
      .resize({ width: 2000, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();
    if (converted.length > 0) return { data: converted.toString("base64"), contentType: "image/webp" };
  } catch {
    // Not a picture sharp can read — fall through to the checks below.
  }

  // Already a format browsers show directly (and sharp could not read it): keep it as it is.
  if (BROWSER_READY.includes(type) && bytes.length <= MAX_UPLOAD_BYTES) {
    return { data: bytes.toString("base64"), contentType: type };
  }

  return {
    problem: IMAGE_TYPES.includes(type)
      ? "That picture could not be read. Try sending it again as a JPG or PNG."
      : "That file is not a picture the website can show. Please send a JPG, PNG, WebP, GIF, BMP, TIFF, HEIC, AVIF or SVG picture.",
  };
}

export async function saveImage(_prev: FormState, formData: FormData): Promise<FormState> {
  await guard();
  await ensurePictureTables();
  const key = imageKeyOf(formData);
  if (!key) return fail("That picture slot is not recognised.");

  const image = await readImageFile(formData);
  if ("problem" in image) return fail(image.problem);

  const values = { key, data: image.data, contentType: image.contentType, updatedAt: new Date() };
  await db.insert(siteImages).values(values).onConflictDoUpdate({ target: siteImages.key, set: values });

  refresh();
  return { ok: true, message: "Updated — it is live on your website now." };
}

export async function deleteImage(formData: FormData): Promise<void> {
  await guard();
  await ensurePictureTables();
  const key = imageKeyOf(formData);
  if (key) await db.delete(siteImages).where(eq(siteImages.key, key));
  refresh();
}

/* ───────────────────────── Gallery ───────────────────────── */

export async function saveGalleryPhoto(_prev: FormState, formData: FormData): Promise<FormState> {
  await guard();
  await ensurePictureTables();
  const image = await readImageFile(formData);
  if ("problem" in image) return fail(image.problem);

  const [last] = await db.select({ value: max(galleryPhotos.sortOrder) }).from(galleryPhotos);
  await db.insert(galleryPhotos).values({
    data: image.data,
    contentType: image.contentType,
    caption: field(formData, "caption", 160),
    sortOrder: (last?.value ?? 0) + 1,
  });

  refresh();
  return { ok: true, message: "Photo added to your gallery." };
}

export async function deleteGalleryPhoto(formData: FormData): Promise<void> {
  await guard();
  await ensurePictureTables();
  const id = idOf(formData);
  if (id) await db.delete(galleryPhotos).where(eq(galleryPhotos.id, id));
  refresh();
}

/* ───────────────────────── Starter content ───────────────────────── */

export async function clearSampleContent(): Promise<void> {
  await guard();
  await db.transaction(async (tx) => {
    await tx.delete(serviceTimes).where(eq(serviceTimes.isSample, true));
    await tx.delete(sermons).where(eq(sermons.isSample, true));
    await tx.delete(events).where(eq(events.isSample, true));
    await tx.delete(galleryPhotos).where(eq(galleryPhotos.isSample, true));
  });
  refresh();
}
