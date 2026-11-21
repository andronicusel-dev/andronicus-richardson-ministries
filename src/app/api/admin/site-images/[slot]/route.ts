import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { siteImages } from "@/db/schema";
import { getAdmin } from "@/lib/auth";
import { isImageSlot } from "@/lib/image-slots";
import { hasSameOrigin, ImageUploadError, normalizeImage } from "@/lib/media-server";
import { allow } from "@/lib/rate-limit";
import { ensureSiteImagesTable } from "@/lib/site-images";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type RouteContext = { params: Promise<{ slot: string }> };

function problem(message: string, status: number) {
  return Response.json({ ok: false, message }, { status });
}

export async function POST(request: Request, { params }: RouteContext) {
  const admin = await getAdmin();
  if (!admin) return problem("Please sign in again before changing pictures.", 401);
  if (!hasSameOrigin(request)) return problem("Please refresh the page and try again.", 403);
  const { slot } = await params;
  if (!isImageSlot(slot)) return problem("That picture position was not found.", 404);
  if (!allow(`image-upload:${admin.id}`, 30, 10 * 60_000)) return problem("Too many changes in a short time. Please wait a few minutes.", 429);

  try {
    const form = await request.formData();
    const image = await normalizeImage(form.get("image"));
    const rawAlt = form.get("altText");
    const altText = typeof rawAlt === "string" ? rawAlt.trim().slice(0, 180) : "";
    const updatedAt = new Date();
    await ensureSiteImagesTable();
    await db.insert(siteImages).values({ slot, ...image, altText, updatedAt }).onConflictDoUpdate({
      target: siteImages.slot,
      set: { ...image, altText, updatedAt },
    });
    revalidatePath("/", "layout");
    return Response.json({ ok: true, src: `/api/site-images/${slot}?v=${updatedAt.getTime()}` });
  } catch (error) {
    if (error instanceof ImageUploadError) return problem(error.message, error.status);
    return problem("We could not save that picture. Please try again.", 500);
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
