import { eq } from "drizzle-orm";
import { db } from "@/db";
import { siteImages } from "@/db/schema";
import { IMAGE_KEYS, type ImageKey } from "@/lib/format";

export const dynamic = "force-dynamic";

/** Serves a picture uploaded from the admin area. */
export async function GET(_request: Request, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  if (!(IMAGE_KEYS as readonly string[]).includes(key)) {
    return new Response("Not found", { status: 404 });
  }
  const [row] = await db
    .select()
    .from(siteImages)
    .where(eq(siteImages.key, key as ImageKey))
    .limit(1);
  if (!row) return new Response("Not found", { status: 404 });

  const bytes = Buffer.from(row.data, "base64");
  return new Response(new Uint8Array(bytes), {
    headers: {
      "Content-Type": row.contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
