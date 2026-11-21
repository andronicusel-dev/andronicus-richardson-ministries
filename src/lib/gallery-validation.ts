import { isISODate } from "@/lib/validate";

type GalleryFields = { program: string; caption: string; altText: string; photoDate: string | null };

export function parseGalleryFields(form: FormData): { ok: true; values: GalleryFields } | { ok: false; message: string } {
  const read = (name: string, max: number) => {
    const value = form.get(name);
    return typeof value === "string" ? value.trim().slice(0, max) : "";
  };
  const photoDate = read("photoDate", 10);
  if (photoDate && !isISODate(photoDate)) return { ok: false, message: "Please choose a valid date for the picture." };
  return {
    ok: true,
    values: {
      program: read("program", 120),
      caption: read("caption", 500),
      altText: read("altText", 180),
      photoDate: photoDate || null,
    },
  };
}
