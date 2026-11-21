import sharp from "sharp";

const MAX_UPLOAD = 4 * 1024 * 1024;

export class ImageUploadError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
    this.name = "ImageUploadError";
  }
}

/** Reject requests that did not originate from this site. */
export function hasSameOrigin(request: Request): boolean {
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

/** Validate actual image bytes, resize and strip metadata before persisting. */
export async function normalizeImage(file: FormDataEntryValue | null): Promise<{ contentType: string; dataBase64: string }> {
  if (!(file instanceof File) || !file.size) throw new ImageUploadError("Choose a picture first.");
  if (file.size > MAX_UPLOAD) throw new ImageUploadError("That picture is too large. Choose a smaller JPG, PNG or WebP.", 413);
  try {
    const input = Buffer.from(await file.arrayBuffer());
    const image = sharp(input, { limitInputPixels: 40_000_000, failOn: "error" });
    const metadata = await image.metadata();
    if (!metadata.format || !["jpeg", "png", "webp"].includes(metadata.format) || (metadata.pages ?? 1) > 1) {
      throw new ImageUploadError("Please choose a JPG, PNG or WebP picture (not an animated image).");
    }
    const output = await image.rotate().resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true }).webp({ quality: 84 }).toBuffer();
    if (output.length > MAX_UPLOAD) throw new ImageUploadError("That picture is too large to save. Choose a smaller one.", 413);
    return { contentType: "image/webp", dataBase64: output.toString("base64") };
  } catch (error) {
    if (error instanceof ImageUploadError) throw error;
    throw new ImageUploadError("We couldn't open that picture. Please choose a valid JPG, PNG or WebP.");
  }
}
