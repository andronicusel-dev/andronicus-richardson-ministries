import { cache } from "react";
import { desc, sql } from "drizzle-orm";
import { db } from "@/db";
import { galleryPhotos } from "@/db/schema";

export type GalleryPhoto = {
  id: number;
  program: string;
  caption: string;
  altText: string;
  photoDate: string | null;
  createdAt: string;
  src: string;
};

/** Existing installations acquire the new table when staff first open the gallery editor. */
export async function ensureGalleryTable(): Promise<void> {
  await db.transaction(async (tx) => {
    await tx.execute(sql`SELECT pg_advisory_xact_lock(72700118)`);
    await tx.execute(sql`
      CREATE TABLE IF NOT EXISTS gallery_photos (
        id serial PRIMARY KEY,
        program text NOT NULL DEFAULT '',
        caption text NOT NULL DEFAULT '',
        alt_text text NOT NULL DEFAULT '',
        photo_date date,
        content_type text NOT NULL,
        data_base64 text NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `);
  });
}

/** Public pages read only metadata; the image bytes are served separately. */
export const getGalleryPhotos = cache(async (limit?: number): Promise<GalleryPhoto[]> => {
  try {
    const query = db.select({
      id: galleryPhotos.id,
      program: galleryPhotos.program,
      caption: galleryPhotos.caption,
      altText: galleryPhotos.altText,
      photoDate: galleryPhotos.photoDate,
      createdAt: galleryPhotos.createdAt,
      updatedAt: galleryPhotos.updatedAt,
    }).from(galleryPhotos).orderBy(desc(galleryPhotos.createdAt), desc(galleryPhotos.id));
    const rows = limit ? await query.limit(limit) : await query;
    return rows.map((row) => ({
      id: row.id,
      program: row.program,
      caption: row.caption,
      altText: row.altText || row.caption || (row.program ? `Photograph from ${row.program}` : "Ministry program photograph"),
      photoDate: row.photoDate,
      createdAt: row.createdAt.toISOString(),
      src: `/api/gallery-images/${row.id}?v=${row.updatedAt.getTime()}`,
    }));
  } catch {
    // A newly upgraded site may not have the gallery table until staff open its editor.
    return [];
  }
});
