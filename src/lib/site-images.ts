import { cache } from "react";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { siteImages } from "@/db/schema";
import { defaultImageManifest, isImageSlot, type SiteImageManifest } from "@/lib/image-slots";

/**
 * Existing installations already have the church tables. Create the new image table only
 * when an authenticated staff member opens the image editor or saves an image. This keeps
 * the existing site working during the upgrade without touching their other data.
 */
export async function ensureSiteImagesTable(): Promise<void> {
  await db.transaction(async (tx) => {
    // Prevent concurrent first-time requests from racing to create the same table.
    await tx.execute(sql`SELECT pg_advisory_xact_lock(72700117)`);
    await tx.execute(sql`
      CREATE TABLE IF NOT EXISTS site_images (
        slot text PRIMARY KEY,
        content_type text NOT NULL,
        data_base64 text NOT NULL,
        alt_text text NOT NULL DEFAULT '',
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `);
  });
}

/** The public pages need only the image version and description, never the image bytes. */
export const getSiteImages = cache(async (): Promise<SiteImageManifest> => {
  const manifest = defaultImageManifest();
  try {
    const rows = await db
      .select({ slot: siteImages.slot, altText: siteImages.altText, updatedAt: siteImages.updatedAt })
      .from(siteImages);
    for (const row of rows) {
      if (!isImageSlot(row.slot)) continue;
      manifest[row.slot] = {
        src: `/api/site-images/${row.slot}?v=${row.updatedAt.getTime()}`,
        alt: row.altText || (row.slot === "logo" ? "" : "Photograph from the ministry"),
        custom: true,
      };
    }
  } catch {
    // On an existing installation the image table may not exist until the staff editor
    // is opened. The public site continues to show its bundled default pictures.
  }
  return manifest;
});
