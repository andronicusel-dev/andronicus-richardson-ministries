import { eq } from "drizzle-orm";
import { db } from "@/db";
import { galleryPhotos } from "@/db/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const id = Number((await params).id);
  if (!Number.isSafeInteger(id) || id <= 0) return new Response("Not found", { status: 404 });
  try {
    const [image] = await db.select({ contentType: galleryPhotos.contentType, dataBase64: galleryPhotos.dataBase64 }).from(galleryPhotos).where(eq(galleryPhotos.id, id)).limit(1);
    if (!image) return new Response("Not found", { status: 404 });
    return new Response(Uint8Array.from(Buffer.from(image.dataBase64, "base64")), {
      headers: {
        "Content-Type": image.contentType,
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
