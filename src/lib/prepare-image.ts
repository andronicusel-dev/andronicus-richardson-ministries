"use client";

const MAX_ORIGINAL_SIZE = 20 * 1024 * 1024;
const MAX_SEND_SIZE = 3.5 * 1024 * 1024;

/** Resize in the browser so ordinary phone photos fit on serverless hosting. */
export async function prepareImage(file: File): Promise<File> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) throw new Error("Please choose a JPG, PNG or WebP picture.");
  if (file.size > MAX_ORIGINAL_SIZE) throw new Error("That file is larger than 20 MB. Please choose a smaller picture.");

  const url = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new window.Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error("We couldn't open that picture. Please choose another JPG, PNG or WebP."));
      element.src = url;
    });
    if (!image.naturalWidth || !image.naturalHeight || image.naturalWidth * image.naturalHeight > 80_000_000) {
      throw new Error("That picture is too large to process. Please choose a smaller image.");
    }
    const scale = Math.min(1, 1600 / image.naturalWidth, 1600 / image.naturalHeight);
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Your browser couldn't prepare the picture. Please try another browser.");
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.84));
    if (!blob || blob.size > MAX_SEND_SIZE) throw new Error("That picture is too large to send. Please choose a smaller one.");
    return new File([blob], blob.type === "image/webp" ? "picture.webp" : "picture.png", { type: blob.type });
  } finally {
    URL.revokeObjectURL(url);
  }
}
