"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

export type GalleryItem = { id: number; caption: string; src: string };

/** The public gallery grid; clicking a photo opens it large with captions and prev/next. */
export function GalleryGrid({ photos }: { photos: GalleryItem[] }) {
  const [selected, setSelected] = useState<number | null>(null);
  const current = selected !== null ? photos[selected] : null;

  const step = useCallback(
    (delta: number) => {
      setSelected((value) =>
        value === null ? value : (value + delta + photos.length) % photos.length,
      );
    },
    [photos.length],
  );

  useEffect(() => {
    if (selected === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelected(null);
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, step]);

  const navButton =
    "flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-paper/30 text-2xl text-paper transition-colors hover:border-brass-300 hover:text-brass-200";

  return (
    <>
      <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {photos.map((photo, index) => (
          <li key={photo.id}>
            <button
              type="button"
              onClick={() => setSelected(index)}
              aria-label={photo.caption ? `View photo: ${photo.caption}` : "View photo"}
              className="group block w-full text-left"
            >
              <span className="relative block aspect-[4/3] overflow-hidden bg-night-800">
                <Image
                  src={photo.src}
                  alt={photo.caption}
                  fill
                  sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 92vw"
                  className="object-cover transition duration-500 group-hover:scale-[1.04]"
                />
              </span>
              {photo.caption ? (
                <span className="mt-3 block font-display text-xl leading-snug">{photo.caption}</span>
              ) : null}
            </button>
          </li>
        ))}
      </ul>

      {current ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={current.caption || "Photo"}
          className="fixed inset-0 z-[90] flex flex-col bg-night-950/95 p-4 sm:p-8"
          onClick={() => setSelected(null)}
        >
          <div className="flex items-center justify-between gap-4 pb-4 text-paper">
            <p className="font-display text-lg sm:text-xl">{current.caption}</p>
            <button
              type="button"
              onClick={() => setSelected(null)}
              aria-label="Close"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-paper/30 text-2xl transition-colors hover:border-brass-300 hover:text-brass-200"
            >
              ×
            </button>
          </div>
          <div className="relative min-h-0 flex-1" onClick={(event) => event.stopPropagation()}>
            <Image
              src={current.src}
              alt={current.caption}
              fill
              sizes="94vw"
              className="object-contain"
            />
          </div>
          {photos.length > 1 ? (
            <div
              className="flex items-center justify-center gap-6 pt-5"
              onClick={(event) => event.stopPropagation()}
            >
              <button type="button" onClick={() => step(-1)} aria-label="Previous photo" className={navButton}>
                ←
              </button>
              <span className="text-sm tracking-wide text-night-300">
                {(selected ?? 0) + 1} of {photos.length}
              </span>
              <button type="button" onClick={() => step(1)} aria-label="Next photo" className={navButton}>
                →
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
