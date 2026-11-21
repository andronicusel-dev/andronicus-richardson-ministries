"use client";

import Image from "next/image";
import { useMemo, useRef, useState, type KeyboardEvent } from "react";
import type { GalleryPhoto } from "@/lib/gallery";
import { formatMediumDate } from "@/lib/format";

export function GalleryGrid({ photos }: { photos: GalleryPhoto[] }) {
  const [program, setProgram] = useState<string | null>(null);
  const [active, setActive] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const programs = useMemo(() => [...new Set(photos.map((photo) => photo.program.trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b)), [photos]);
  const shown = program === null ? photos : photos.filter((photo) => photo.program.trim() === program);
  const selected = active === null ? null : shown[active] ?? null;

  function open(index: number) {
    setActive(index);
    requestAnimationFrame(() => { if (dialogRef.current && !dialogRef.current.open) dialogRef.current.showModal(); });
  }
  function change(direction: number) {
    if (!shown.length) return;
    setActive((index) => index === null ? 0 : (index + direction + shown.length) % shown.length);
  }
  function keyDown(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key === "ArrowLeft") { event.preventDefault(); change(-1); }
    if (event.key === "ArrowRight") { event.preventDefault(); change(1); }
  }

  return (
    <>
      {programs.length ? (
        <div className="mb-10 flex flex-wrap gap-2" aria-label="Filter photographs by program">
          <button type="button" aria-pressed={program === null} onClick={() => setProgram(null)} className={`min-h-11 rounded-sm border px-4 py-2 text-sm font-semibold transition-colors ${program === null ? "border-night-800 bg-night-800 text-paper" : "border-rule bg-card text-ink hover:border-night-600"}`}>All photos</button>
          {programs.map((name) => <button key={name} type="button" aria-pressed={program === name} onClick={() => setProgram(name)} className={`min-h-11 rounded-sm border px-4 py-2 text-sm font-semibold transition-colors ${program === name ? "border-night-800 bg-night-800 text-paper" : "border-rule bg-card text-ink hover:border-night-600"}`}>{name}</button>)}
        </div>
      ) : null}
      <ul className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((photo, index) => (
          <li key={photo.id}>
            <figure>
              <button type="button" onClick={() => open(index)} aria-label={`View photograph: ${photo.altText}`} className="group relative block aspect-[4/3] w-full overflow-hidden bg-night-800 text-left">
                <Image src={photo.src} alt="" fill unoptimized sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none" />
                <span className="absolute bottom-3 right-3 bg-night-950/85 px-3 py-1 text-xs font-semibold tracking-wide text-paper">View photo ↗</span>
              </button>
              <figcaption className="border-b border-rule pb-5 pt-4">
                <h2 className="text-2xl">{photo.program || "Ministry moments"}</h2>
                {photo.photoDate ? <p className="mt-2 text-sm font-semibold tracking-wide text-brass-700">{formatMediumDate(photo.photoDate)}</p> : null}
                {photo.caption ? <p className="mt-2 whitespace-pre-wrap break-words text-ink-soft">{photo.caption}</p> : null}
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
      <dialog ref={dialogRef} onClose={() => setActive(null)} onKeyDown={keyDown} onClick={(event) => { if (event.target === dialogRef.current) dialogRef.current?.close(); }} aria-label="Photograph viewer" className="fixed inset-0 z-50 m-auto max-h-[94dvh] w-[min(94vw,72rem)] max-w-none overflow-y-auto bg-night-950 p-0 text-paper shadow-2xl backdrop:bg-black/85">
        {selected ? (
          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between gap-4 pb-4">
              <p className="eyebrow text-brass-300">{(active ?? 0) + 1} / {shown.length}</p>
              <button type="button" onClick={() => dialogRef.current?.close()} className="min-h-11 rounded-sm border border-paper/35 px-4 font-semibold text-paper hover:border-brass-300">Close <span aria-hidden="true">×</span></button>
            </div>
            <div className="relative h-[min(58vh,40rem)] bg-black/30">
              <Image src={selected.src} alt={selected.altText} fill unoptimized sizes="90vw" className="object-contain" />
            </div>
            <div className="flex flex-wrap items-end justify-between gap-4 pt-5">
              <div className="min-w-0">
                <h2 className="text-2xl sm:text-3xl">{selected.program || "Ministry moments"}</h2>
                {selected.photoDate ? <p className="mt-2 text-sm font-semibold text-brass-300">{formatMediumDate(selected.photoDate)}</p> : null}
                {selected.caption ? <p className="mt-2 max-w-2xl whitespace-pre-wrap break-words text-paper/80">{selected.caption}</p> : null}
              </div>
              {shown.length > 1 ? <div className="flex gap-2"><button type="button" onClick={() => change(-1)} className="btn btn-light min-h-11 px-4 py-2">← Previous</button><button type="button" onClick={() => change(1)} className="btn btn-light min-h-11 px-4 py-2">Next →</button></div> : null}
            </div>
          </div>
        ) : null}
      </dialog>
    </>
  );
}
