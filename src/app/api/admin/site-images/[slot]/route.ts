import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import sharp from "sharp";
import { db } from "@/db";
import { siteImages } from "@/db/schema";
import { getAdmin } from "@/lib/auth";
import { isImageSlot } from "@/lib/image-slots";
import { allow } from "@/lib/rate-limit";
import { ensureSiteImagesTable } from "@/lib/site-images";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_UPLOAD = 4 * 1024 * 1024;
type RouteContext = { params: Promise<{ slot: string }> };

/** Reject cross-site form submissions as well as unauthenticated requests. */
function hasSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    const originHost = new URL(origin).host.toLowerCase();
    const hosts = [
      request.headers.get("x-forwarded-host")?.split(",")[0]?.trim(),
      request.headers.get("host"),
      new URL(request.url).host,
    ];
    return hosts.some((host) => host?.toLowerCase() === originHost);
  } catch {
    return false;
  }
}

function problem(message: string, status: number) {
  return Response.json({ ok: false, message }, { status });
}

export async function POST(request: Request, { params }: RouteContext) {
  const admin = await getAdmin();
  if (!admin) return problem("Please sign in again before changing pictures.", 401);
  if (!hasSameOrigin(request)) return problem("Please refresh the page and try again.", 403);
  const { slot } = await params;
  if (!isImageSlot(slot)) return problem("That picture position was not found.", 404);
  if (!allow(`image-upload:${admin.id}`, 30, 10 * 60_000)) {
    return problem("Too many changes in a short time. Please wait a few minutes.", 429);
  }

  try {
    const form = await request.formData();
    const file = form.get("image");
    if (!(file instanceof File) || !file.size) return problem("Choose a picture first.", 400);
    if (file.size > MAX_UPLOAD) return problem("That picture is too large. Choose a smaller JPG, PNG or WebP.", 413);

    const input = Buffer.from(await file.arrayBuffer());
    const image = sharp(input, { limitInputPixels: 40_000_000, failOn: "error" });
    const metadata = await image.metadata();
    if (!metadata.format || !["jpeg", "png", "webp"].includes(metadata.format) || (metadata.pages ?? 1) > 1) {
      return problem("Please choose a JPG, PNG or WebP picture (not an animated image).", 400);
    }

    // Normalize to WebP, remove metadata, cap dimensions, and keep transparency for logos.
    const output = await image
      .rotate()
      .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 84 })
      .toBuffer();
    if (output.length > MAX_UPLOAD) return problem("That picture is too large to save. Please choose a smaller one.", 413);

    const rawAlt = form.get("altText");
    const altText = typeof rawAlt === "string" ? rawAlt.trim().slice(0, 180) : "";
    const updatedAt = new Date();
    await ensureSiteImagesTable();
    await db
      .insert(siteImages)
      .values({ slot, contentType: "image/webp", dataBase64: output.toString("base64"), altText, updatedAt })
      .onConflictDoUpdate({
        target: siteImages.slot,
        set: { contentType: "image/webp", dataBase64: output.toString("base64"), altText, updatedAt },
      });
    revalidatePath("/", "layout");
    return Response.json({ ok: true, src: `/api/site-images/${slot}?v=${updatedAt.getTime()}` });
  } catch {
    return problem("We could not save that picture. Please choose a valid image and try again.", 500);
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  const admin = await getAdmin();
  if (!admin) return problem("Please sign in again before changing pictures.", 401);
  if (!hasSameOrigin(request)) return problem("Please refresh the page and try again.", 403);
  const { slot } = await params;
  if (!isImageSlot(slot)) return problem("That picture position was not found.", 404);

  try {
    await ensureSiteImagesTable();
    await db.delete(siteImages).where(eq(siteImages.slot, slot));
    revalidatePath("/", "layout");
    return Response.json({ ok: true });
  } catch {
    return problem("We could not restore the original picture. Please try again.", 500);
  }
}
