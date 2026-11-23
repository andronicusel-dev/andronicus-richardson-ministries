import { eq } from "drizzle-orm";
import { db } from "@/db";
import { galleryPhotos } from "@/db/schema";

export const dynamic = "force-dynamic";

/** Serves one gallery photo. Starter photos live as files; uploaded ones are stored in the database. */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const photoId = Number(id);
  if (!Number.isInteger(photoId) || photoId <= 0) return new Response("Not found", { status: 404 });

  const [row] = await db.select().from(galleryPhotos).where(eq(galleryPhotos.id, photoId)).limit(1);
  if (!row) return new Response("Not found", { status: 404 });

  if (row.filePath) return Response.redirect(new URL(row.filePath, request.url), 307);

  const bytes = Buffer.from(row.data, "base64");
  return new Response(new Uint8Array(bytes), {
    headers: {
      "Content-Type": row.contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
