import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { galleryPhotos } from "@/db/schema";
import { getAdmin } from "@/lib/auth";
import { ensureGalleryTable } from "@/lib/gallery";
import { parseGalleryFields } from "@/lib/gallery-validation";
import { hasSameOrigin, ImageUploadError, normalizeImage } from "@/lib/media-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type RouteContext = { params: Promise<{ id: string }> };
const problem = (message: string, status: number) => Response.json({ ok: false, message }, { status });

export async function PATCH(request: Request, { params }: RouteContext) {
  const admin = await getAdmin();
  if (!admin) return problem("Please sign in again before changing photos.", 401);
  if (!hasSameOrigin(request)) return problem("Please refresh the page and try again.", 403);
  const id = Number((await params).id);
  if (!Number.isSafeInteger(id) || id <= 0) return problem("That photo was not found.", 404);
  try {
    const form = await request.formData();
    const fields = parseGalleryFields(form);
    if (!fields.ok) return problem(fields.message, 400);
    const replacement = form.get("image");
    const image = replacement instanceof File && replacement.size > 0 ? await normalizeImage(replacement) : {};
    await ensureGalleryTable();
    const [row] = await db.update(galleryPhotos).set({ ...fields.values, ...image, updatedAt: new Date() }).where(eq(galleryPhotos.id, id)).returning({ id: galleryPhotos.id });
    if (!row) return problem("That photo was not found.", 404);
    revalidatePath("/", "layout");
    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof ImageUploadError) return problem(error.message, error.status);
    return problem("We could not save those changes. Please try again.", 500);
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  const admin = await getAdmin();
  if (!admin) return problem("Please sign in again before removing photos.", 401);
  if (!hasSameOrigin(request)) return problem("Please refresh the page and try again.", 403);
  const id = Number((await params).id);
  if (!Number.isSafeInteger(id) || id <= 0) return problem("That photo was not found.", 404);
  try {
    await ensureGalleryTable();
    const [row] = await db.delete(galleryPhotos).where(eq(galleryPhotos.id, id)).returning({ id: galleryPhotos.id });
    if (!row) return problem("That photo was not found.", 404);
    revalidatePath("/", "layout");
    return Response.json({ ok: true });
  } catch {
    return problem("We could not remove that photo. Please try again.", 500);
  }
}
