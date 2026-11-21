import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { galleryPhotos } from "@/db/schema";
import { getAdmin } from "@/lib/auth";
import { ensureGalleryTable } from "@/lib/gallery";
import { parseGalleryFields } from "@/lib/gallery-validation";
import { hasSameOrigin, ImageUploadError, normalizeImage } from "@/lib/media-server";
import { allow } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const problem = (message: string, status: number) => Response.json({ ok: false, message }, { status });

export async function POST(request: Request) {
  const admin = await getAdmin();
  if (!admin) return problem("Please sign in again before adding photos.", 401);
  if (!hasSameOrigin(request)) return problem("Please refresh the page and try again.", 403);
  if (!allow(`gallery-upload:${admin.id}`, 100, 10 * 60_000)) return problem("Too many uploads at once. Please wait a few minutes.", 429);

  try {
    const form = await request.formData();
    const fields = parseGalleryFields(form);
    if (!fields.ok) return problem(fields.message, 400);
    const image = await normalizeImage(form.get("image"));
    await ensureGalleryTable();
    const [row] = await db.insert(galleryPhotos).values({ ...fields.values, ...image }).returning({ id: galleryPhotos.id });
    revalidatePath("/", "layout");
    return Response.json({ ok: true, id: row.id });
  } catch (error) {
    if (error instanceof ImageUploadError) return problem(error.message, error.status);
    return problem("We could not add that photo. Please try again.", 500);
  }
}
