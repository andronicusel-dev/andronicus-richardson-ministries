import Image from "next/image";
import Link from "next/link";
import type { GalleryPhoto } from "@/lib/gallery";

export function GalleryTeaser({ photos }: { photos: GalleryPhoto[] }) {
  const columns = photos.length >= 3 ? "grid-cols-3" : photos.length === 2 ? "grid-cols-2" : "grid-cols-1";
  return (
    <section className="bg-paper-deep">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 sm:px-8 lg:grid-cols-12 lg:gap-16 lg:py-24">
        <div className="lg:col-span-5">
          <p className="eyebrow text-brass-700">Our gallery</p>
          <h2 className="mt-4 text-[clamp(2rem,4.6vw,3.4rem)]">Moments worth keeping.</h2>
          <p className="mt-5 max-w-lg text-lg text-ink-soft">{photos.length ? "A glimpse of the worship, fellowship and ministry programs we have shared together." : "Photographs from our worship, outreach and programs will be shared here."}</p>
          <Link href="/gallery" className="link-rule mt-6 text-night-700">Explore the gallery <span aria-hidden="true">→</span></Link>
        </div>
        <div className="lg:col-span-7">
          {photos.length ? (
            <div className={`grid ${columns} gap-2 sm:gap-4`}>
              {photos.map((photo) => <Link key={photo.id} href="/gallery" aria-label={`View the gallery: ${photo.altText}`} className="group relative block aspect-[4/5] overflow-hidden bg-night-800"><Image src={photo.src} alt="" fill unoptimized sizes="(min-width: 1024px) 22vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none" /></Link>)}
            </div>
          ) : (
            <div className="relative aspect-[16/9] overflow-hidden bg-night-800">
              <Image src="/images/welcome-community.jpg" alt="Illustrative image of people greeting each other" fill sizes="(min-width: 1024px) 52vw, 90vw" className="object-cover object-[center_55%]" />
              <span className="absolute bottom-3 right-3 bg-night-950/80 px-3 py-1 text-xs font-semibold text-paper">Illustrative image</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
