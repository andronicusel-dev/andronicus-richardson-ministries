import { eq } from "drizzle-orm";
import { db } from "@/db";
import { siteImages } from "@/db/schema";
import { isImageSlot } from "@/lib/image-slots";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ slot: string }> };

/** Uploaded images are public, like the photographs bundled with the website. */
export async function GET(_request: Request, { params }: RouteContext) {
  const { slot } = await params;
  if (!isImageSlot(slot)) return new Response("Not found", { status: 404 });

  try {
    const [image] = await db.select().from(siteImages).where(eq(siteImages.slot, slot)).limit(1);
    if (!image) return new Response("Not found", { status: 404 });
    const bytes = Uint8Array.from(Buffer.from(image.dataBase64, "base64"));
    return new Response(bytes, {
      headers: {
        "Content-Type": image.contentType,
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "public, max-age=0, s-maxage=3600",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
