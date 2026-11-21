"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { GalleryPhoto } from "@/lib/gallery";
import { formatMediumDate } from "@/lib/format";
import { prepareImage } from "@/lib/prepare-image";

const MAX_BATCH = 12;
type Result = { ok: boolean; text: string } | null;

/** Staff can upload a small group of photos under the same program and date. */
export function GalleryUploader() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const id = useId();
  const [files, setFiles] = useState<File[]>([]);
  const [program, setProgram] = useState("");
  const [photoDate, setPhotoDate] = useState("");
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [result, setResult] = useState<Result>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!files.length || busy) return;
    if (files.length > MAX_BATCH) {
      setResult({ ok: false, text: `Please choose up to ${MAX_BATCH} photos at a time.` });
      return;
    }
    setBusy(true);
    setResult(null);
    let completed = 0;
    try {
      for (const file of files) {
        setProgress(`Preparing and uploading ${completed + 1} of ${files.length}…`);
        const image = await prepareImage(file);
        const form = new FormData();
        form.append("image", image);
        form.append("program", program);
        form.append("photoDate", photoDate);
        form.append("caption", caption);
        const response = await fetch("/api/admin/gallery", { method: "POST", body: form });
        const body = (await response.json().catch(() => ({}))) as { ok?: boolean; message?: string };
        if (!response.ok || !body.ok) throw new Error(body.message || "Could not upload this picture.");
        completed += 1;
      }
      setFiles([]);
      if (inputRef.current) inputRef.current.value = "";
      setResult({ ok: true, text: `${completed} ${completed === 1 ? "photo is" : "photos are"} now in your public gallery.` });
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not upload that picture.";
      // Avoid re-uploading already saved files if a later file in the group fails.
      if (completed) {
        setFiles([]);
        if (inputRef.current) inputRef.current.value = "";
        router.refresh();
      }
      setResult({ ok: false, text: `${completed ? `${completed} saved. Select the remaining photos again. ` : ""}${message}` });
    } finally {
      setBusy(false);
      setProgress("");
    }
  }

  return (
    <section className="a-card p-5 sm:p-7">
      <h2 className="font-sans text-xl font-bold">Add program photos</h2>
      <p className="mt-1 text-ink-soft">Choose up to {MAX_BATCH} pictures. A program name and date help visitors find them.</p>
      <form onSubmit={submit} className="mt-5 space-y-4">
        <div>
          <label htmlFor={`${id}-files`} className="a-label">Choose photos</label>
          <input ref={inputRef} id={`${id}-files`} type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(event) => { setFiles(Array.from(event.target.files ?? [])); setResult(null); }} className="block w-full rounded border border-rule bg-white p-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-paper-deep file:px-3 file:py-2 file:font-semibold file:text-ink" />
          <p className="a-hint">JPG, PNG or WebP, up to 20 MB each. Pictures are resized for you. {files.length ? `${files.length} selected.` : ""}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block"><span className="a-label">Program or event name <span className="a-optional">(optional)</span></span><input value={program} onChange={(event) => setProgram(event.target.value)} maxLength={120} placeholder="For example, Community Outreach" className="a-input" /></label>
          <label className="block"><span className="a-label">Date <span className="a-optional">(optional)</span></span><input type="date" value={photoDate} onChange={(event) => setPhotoDate(event.target.value)} className="a-input" /></label>
        </div>
        <label className="block"><span className="a-label">Caption <span className="a-optional">(optional)</span></span><textarea value={caption} onChange={(event) => setCaption(event.target.value)} rows={2} maxLength={500} placeholder="A few words about the moment" className="a-input resize-y" /><span className="a-hint">This caption will be added to each selected photo; you can edit them individually afterward.</span></label>
        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" disabled={!files.length || busy} className="a-btn">{busy ? "Uploading…" : "Add to gallery"}</button>
          <p role="status" aria-live="polite" className={`text-sm font-semibold ${result?.ok ? "text-good" : "text-alert"}`}>{progress || result?.text || ""}</p>
        </div>
      </form>
    </section>
  );
}

/** Each published gallery image can be renamed, replaced or removed. */
export function GalleryItemEditor({ photo }: { photo: GalleryPhoto }) {
  const router = useRouter();
  const fieldId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [program, setProgram] = useState(photo.program);
  const [caption, setCaption] = useState(photo.caption);
  const [altText, setAltText] = useState(photo.altText);
  const [photoDate, setPhotoDate] = useState(photo.photoDate ?? "");
  const [replacement, setReplacement] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [result, setResult] = useState<Result>(null);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true); setResult(null);
    try {
      const form = new FormData();
      form.append("program", program);
      form.append("caption", caption);
      form.append("altText", altText);
      form.append("photoDate", photoDate);
      if (replacement) form.append("image", await prepareImage(replacement));
      const response = await fetch(`/api/admin/gallery/${photo.id}`, { method: "PATCH", body: form });
      const body = (await response.json().catch(() => ({}))) as { ok?: boolean; message?: string };
      if (!response.ok || !body.ok) throw new Error(body.message || "Could not save the changes.");
      setReplacement(null);
      if (inputRef.current) inputRef.current.value = "";
      setResult({ ok: true, text: "Saved. Your gallery is updated." });
      router.refresh();
    } catch (error) {
      setResult({ ok: false, text: error instanceof Error ? error.message : "Could not save the changes." });
    } finally { setBusy(false); }
  }

  async function remove() {
    if (busy) return;
    setBusy(true); setResult(null);
    try {
      const response = await fetch(`/api/admin/gallery/${photo.id}`, { method: "DELETE" });
      const body = (await response.json().catch(() => ({}))) as { ok?: boolean; message?: string };
      if (!response.ok || !body.ok) throw new Error(body.message || "Could not remove the photo.");
      router.refresh();
    } catch (error) {
      setResult({ ok: false, text: error instanceof Error ? error.message : "Could not remove the photo." });
      setBusy(false);
    }
  }

  return (
    <article className="a-card overflow-hidden">
      <div className="grid sm:grid-cols-[13rem_minmax(0,1fr)]">
        <div className="relative aspect-[4/3] bg-paper-deep sm:aspect-auto sm:min-h-48">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo.src} alt={photo.altText} className="absolute inset-0 h-full w-full object-cover" />
        </div>
        <div className="min-w-0 p-5 sm:p-6">
          <h3 className="font-sans text-lg font-bold">{photo.program || "Ministry photo"}</h3>
          {photo.photoDate ? <p className="mt-1 text-sm text-ink-soft">{formatMediumDate(photo.photoDate)}</p> : null}
          {photo.caption ? <p className="mt-2 whitespace-pre-wrap break-words text-ink-soft">{photo.caption}</p> : null}
          <details className="mt-4">
            <summary className="a-btn-quiet list-none [&::-webkit-details-marker]:hidden">Edit details or replace image</summary>
            <form onSubmit={save} className="mt-4 space-y-4 border-t border-rule pt-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label htmlFor={`${fieldId}-program`} className="a-label">Program name</label><input id={`${fieldId}-program`} value={program} onChange={(event) => setProgram(event.target.value)} maxLength={120} className="a-input" /></div>
                <div><label htmlFor={`${fieldId}-date`} className="a-label">Date</label><input id={`${fieldId}-date`} type="date" value={photoDate} onChange={(event) => setPhotoDate(event.target.value)} className="a-input" /></div>
              </div>
              <div><label htmlFor={`${fieldId}-caption`} className="a-label">Caption</label><textarea id={`${fieldId}-caption`} value={caption} onChange={(event) => setCaption(event.target.value)} maxLength={500} rows={2} className="a-input resize-y" /></div>
              <div><label htmlFor={`${fieldId}-alt`} className="a-label">Image description</label><input id={`${fieldId}-alt`} value={altText} onChange={(event) => setAltText(event.target.value)} maxLength={180} className="a-input" aria-describedby={`${fieldId}-alt-hint`} /><span id={`${fieldId}-alt-hint`} className="a-hint">A short description for visitors using a screen reader.</span></div>
              <div><label htmlFor={`${fieldId}-replace`} className="a-label">Replace picture <span className="a-optional">(optional)</span></label><input id={`${fieldId}-replace`} ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setReplacement(event.target.files?.[0] ?? null)} className="block w-full rounded border border-rule p-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-paper-deep file:px-3 file:py-2 file:font-semibold" /></div>
              <button type="submit" disabled={busy} className="a-btn">{busy ? "Saving…" : "Save changes"}</button>
            </form>
          </details>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {!confirmDelete ? <button type="button" disabled={busy} onClick={() => setConfirmDelete(true)} className="a-btn-quiet a-btn-danger">Delete photo</button> : <div className="flex flex-wrap items-center gap-2 rounded bg-[#fbeeec] p-3"><span className="text-sm font-semibold text-alert">Delete this photo permanently?</span><button type="button" disabled={busy} onClick={remove} className="a-btn-quiet a-btn-danger">Yes, delete</button><button type="button" disabled={busy} onClick={() => setConfirmDelete(false)} className="a-btn-quiet">Cancel</button></div>}
          </div>
          <p role="status" aria-live="polite" className={`mt-2 text-sm font-semibold ${result?.ok ? "text-good" : "text-alert"}`}>{result?.text ?? ""}</p>
        </div>
      </div>
    </article>
  );
}
