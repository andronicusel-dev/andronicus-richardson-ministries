"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { IMAGE_SLOTS, type ImageSlot, type SiteImage } from "@/lib/image-slots";

const MAX_ORIGINAL_SIZE = 20 * 1024 * 1024;
const MAX_SEND_SIZE = 3.5 * 1024 * 1024;

/** Resize in the browser first so ordinary phone photos fit on serverless hosting. */
async function prepareImage(file: File): Promise<File> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    throw new Error("Please choose a JPG, PNG or WebP picture.");
  }
  if (file.size > MAX_ORIGINAL_SIZE) {
    throw new Error("That file is larger than 20 MB. Please choose a smaller picture.");
  }

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
    if (!blob || blob.size > MAX_SEND_SIZE) {
      throw new Error("That picture is too large to send. Please choose a smaller one.");
    }
    return new File([blob], blob.type === "image/webp" ? "picture.webp" : "picture.png", { type: blob.type });
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function ImageEditor({ slot, initial }: { slot: ImageSlot; initial: SiteImage }) {
  const details = IMAGE_SLOTS[slot];
  const router = useRouter();
  const fileId = useId();
  const altId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [current, setCurrent] = useState(initial.src);
  const [isCustom, setIsCustom] = useState(initial.custom);
  const [altText, setAltText] = useState(initial.custom ? initial.alt : "");
  const [busy, setBusy] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file || busy) return;
    setBusy(true);
    setResult(null);
    try {
      const prepared = await prepareImage(file);
      const form = new FormData();
      form.append("image", prepared);
      form.append("altText", altText);
      const response = await fetch(`/api/admin/site-images/${slot}`, { method: "POST", body: form });
      const body = (await response.json().catch(() => ({}))) as { ok?: boolean; message?: string; src?: string };
      if (!response.ok || !body.ok || !body.src) throw new Error(body.message || "We could not save the picture. Please try again.");
      setCurrent(body.src);
      setIsCustom(true);
      setFile(null);
      setPreview(null);
      if (inputRef.current) inputRef.current.value = "";
      setResult({ ok: true, text: "Saved! Your website has been updated." });
      setConfirmReset(false);
      router.refresh();
    } catch (error) {
      setResult({ ok: false, text: error instanceof Error ? error.message : "We could not save the picture. Please try again." });
    } finally {
      setBusy(false);
    }
  }

  async function reset() {
    if (busy) return;
    setBusy(true);
    setResult(null);
    try {
      const response = await fetch(`/api/admin/site-images/${slot}`, { method: "DELETE" });
      const body = (await response.json().catch(() => ({}))) as { ok?: boolean; message?: string };
      if (!response.ok || !body.ok) throw new Error(body.message || "We could not restore the original. Please try again.");
      setCurrent(details.defaultSrc);
      setIsCustom(false);
      setFile(null);
      setPreview(null);
      setAltText("");
      setConfirmReset(false);
      if (inputRef.current) inputRef.current.value = "";
      setResult({ ok: true, text: slot === "logo" ? "The original ministry mark is back." : "The original picture is back." });
      router.refresh();
    } catch (error) {
      setResult({ ok: false, text: error instanceof Error ? error.message : "We could not restore the original. Please try again." });
    } finally {
      setBusy(false);
    }
  }

  const shown = preview || current;
  return (
    <section className="a-card overflow-hidden">
      <div className="grid md:grid-cols-[15rem_minmax(0,1fr)]">
        <div className={`relative flex min-h-48 items-center justify-center overflow-hidden ${slot === "logo" ? "bg-night-950" : "bg-paper-deep"}`}>
          {shown ? (
            // The preview may be a local blob URL, so it is deliberately not passed through Next's image optimizer.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={shown} alt="" className={slot === "logo" ? "max-h-36 max-w-[75%] object-contain p-2" : "absolute inset-0 h-full w-full object-cover"} />
          ) : (
            <svg viewBox="0 0 32 40" fill="none" aria-hidden="true" className="h-24 w-20 text-brass-300">
              <path d="M2 39V16C2 8.27 8.27 2 16 2s14 6.27 14 14v23" stroke="currentColor" strokeWidth="1.5" />
              <path d="M9.5 39V17a6.5 6.5 0 0 1 13 0v22z" fill="currentColor" />
            </svg>
          )}
          <span className="absolute bottom-2 left-2 rounded bg-night-950/85 px-2 py-1 text-xs font-semibold text-paper">
            {preview ? "New picture preview" : isCustom ? "Your picture" : "Original"}
          </span>
        </div>
        <div className="p-5 sm:p-6">
          <h2 className="font-sans text-xl font-bold">{details.label}</h2>
          <p className="mt-1 text-ink-soft">{details.location}</p>
          <p className="mt-2 text-sm text-ink-soft">{details.tip}</p>
          <form onSubmit={onSubmit} className="mt-5 space-y-4">
            <div>
              <label htmlFor={fileId} className="a-label">Choose a {slot === "logo" ? "logo" : "picture"}</label>
              <input
                ref={inputRef}
                id={fileId}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => {
                  const selected = event.target.files?.[0] ?? null;
                  setFile(selected);
                  setPreview(selected ? URL.createObjectURL(selected) : null);
                  setResult(null);
                }}
                className="block w-full rounded border border-rule bg-white p-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-paper-deep file:px-3 file:py-2 file:font-semibold file:text-ink"
              />
              <p className="a-hint">JPG, PNG or WebP, up to 20 MB. We resize it for you.</p>
            </div>
            {slot !== "logo" && file ? (
              <div>
                <label htmlFor={altId} className="a-label">Describe this picture <span className="a-optional">(optional)</span></label>
                <input id={altId} value={altText} onChange={(event) => setAltText(event.target.value)} maxLength={180} className="a-input" placeholder="For example, members gathering for worship" />
                <p className="a-hint">Helps visitors who use a screen reader.</p>
              </div>
            ) : null}
            <div className="flex flex-wrap items-center gap-3">
              <button type="submit" disabled={!file || busy} className="a-btn">
                {busy ? "Working…" : slot === "logo" ? "Save logo" : "Save picture"}
              </button>
              {isCustom && !confirmReset ? (
                <button type="button" disabled={busy} onClick={() => setConfirmReset(true)} className="a-btn-quiet">
                  {slot === "logo" ? "Remove custom logo" : "Restore original"}
                </button>
              ) : null}
            </div>
            {confirmReset ? (
              <div className="flex flex-wrap items-center gap-2 rounded bg-paper p-3">
                <span className="text-sm font-semibold">{slot === "logo" ? "Return to the original mark?" : "Replace your picture with the original?"}</span>
                <button type="button" disabled={busy} onClick={reset} className="a-btn-quiet">Yes, restore</button>
                <button type="button" disabled={busy} onClick={() => setConfirmReset(false)} className="a-btn-quiet">Cancel</button>
              </div>
            ) : null}
            <p role="status" aria-live="polite" className={`text-sm font-semibold ${result?.ok ? "text-good" : "text-alert"}`}>
              {result?.text ?? ""}
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
