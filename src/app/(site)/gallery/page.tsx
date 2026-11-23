import type { Metadata } from "next";
import Link from "next/link";
import { GalleryGrid } from "@/components/gallery-lightbox";
import { PageHero } from "@/components/ui";
import { gallerySrc, getGalleryPhotos } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Photos from services and programs at Andronicus Richardson Ministries.",
};

export default async function GalleryPage() {
  const photos = await getGalleryPhotos();

  return (
    <>
      <PageHero
        eyebrow="Gallery"
        title="Moments from the Ministry"
        lead="Pictures from our services, programs and time together as a church family."
      />

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-24">
        {photos.length > 0 ? (
          <GalleryGrid photos={photos.map((photo) => ({ id: photo.id, caption: photo.caption, src: gallerySrc(photo) }))} />
        ) : (
          <div className="max-w-xl">
            <h2 className="text-3xl">Photos will appear here soon.</h2>
            <p className="mt-4 text-lg text-ink-soft">
              We are gathering pictures from our services and programs. In the meantime, come and be part of the
              next one.
            </p>
            <Link href="/events" className="btn btn-ink mt-8">
              See what's coming up
            </Link>
          </div>
        )}
      </section>
    </>
  );
}
