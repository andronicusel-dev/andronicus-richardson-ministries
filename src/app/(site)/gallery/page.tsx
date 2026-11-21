import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { GalleryGrid } from "@/components/gallery-grid";
import { PageHero, Scripture } from "@/components/ui";
import { getGalleryPhotos } from "@/lib/gallery";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Gallery",
  description: "Photographs from the programs and gatherings of Andronicus Richardson Ministries.",
};

export default async function GalleryPage() {
  const photos = await getGalleryPhotos();
  return (
    <>
      <PageHero eyebrow="Gallery" title="Moments in Ministry" lead="A glimpse of the worship, fellowship and programs we share together." />
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-24">
        {photos.length ? (
          <>
            <div className="mb-8 flex flex-wrap items-baseline justify-between gap-3 border-b border-rule pb-5">
              <h2 className="text-3xl sm:text-4xl">Our photographs</h2>
              <p className="text-sm font-semibold tracking-wide text-ink-soft">{photos.length} {photos.length === 1 ? "photo" : "photos"}</p>
            </div>
            <GalleryGrid photos={photos} />
          </>
        ) : (
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <div>
              <p className="eyebrow text-brass-700">Our gallery</p>
              <h2 className="mt-4 text-[clamp(2rem,4vw,3.25rem)]">A story still unfolding.</h2>
              <p className="mt-6 max-w-xl text-lg text-ink-soft">Photographs from our worship, outreach and ministry programs will be shared here. Come back soon to see the moments we have celebrated together.</p>
              <Link href="/contact" className="btn btn-ink mt-8">Come and visit</Link>
            </div>
            <div className="relative ml-3 mt-3">
              <div aria-hidden="true" className="absolute -left-3 -top-3 h-full w-full border border-brass-500/60" />
              <div className="relative aspect-[4/3] overflow-hidden bg-night-800">
                <Image src="/images/welcome-community.jpg" alt="Illustrative image of people greeting one another" fill sizes="(min-width: 1024px) 45vw, 90vw" className="object-cover" />
                <span className="absolute bottom-3 right-3 bg-night-950/80 px-3 py-1 text-xs font-semibold text-paper">Illustrative image</span>
              </div>
            </div>
          </div>
        )}
        <Scripture cite="Psalm 118:24" className="mx-auto mt-20 max-w-2xl text-center">This is the day which the LORD hath made; we will rejoice and be glad in it.</Scripture>
      </section>
    </>
  );
}
