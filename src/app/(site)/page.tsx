import Image from "next/image";
import Link from "next/link";
import { EventRow } from "@/components/lists";
import { GalleryTeaser } from "@/components/gallery-teaser";
import { ArchImage, ArchLines, DateTile, Gatherings, Prose, Scripture } from "@/components/ui";
import { getSermons, getServiceTimes, getSettings, getUpcomingEvents } from "@/lib/data";
import { formatLongDate, formatMediumDate, paragraphs } from "@/lib/format";
import { getSiteImages } from "@/lib/site-images";
import { getGalleryPhotos } from "@/lib/gallery";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [settings, services, sermons, events, images, gallery] = await Promise.all([
    getSettings(),
    getServiceTimes(),
    getSermons(3),
    getUpcomingEvents(3),
    getSiteImages(),
    getGalleryPhotos(3),
  ]);
  const [latest, ...earlier] = sermons;
  const sectionTitle = "text-[clamp(2rem,4.6vw,3.4rem)]";

  return (
    <>
      {/* ── Hero: the name, the invitation, the light ── */}
      <section className="hero-light relative overflow-hidden text-paper">
        <div className="mx-auto grid max-w-7xl items-center gap-16 px-5 pb-44 pt-12 sm:px-8 lg:grid-cols-12 lg:gap-10 lg:pb-56 lg:pt-20">
          <div className="lg:col-span-7">
            <p className="eyebrow rise text-brass-300">Welcome to</p>
            <h1 className="rise rise-1 mt-5 text-[clamp(2.25rem,9vw,5.25rem)] leading-[1.02] lg:text-[clamp(3.5rem,6.2vw,5.25rem)]">
              Andronicus
              <br />
              Richardson
              <span className="mt-5 block font-sans text-[clamp(0.8rem,2.4vw,1.05rem)] font-semibold uppercase leading-none tracking-[0.5em] text-brass-300">
                Ministries
              </span>
            </h1>
            <p className="rise rise-2 mt-8 max-w-xl font-serif text-[1.4rem] leading-snug text-paper/85 sm:text-[1.65rem]">
              {settings.tagline}
            </p>
            <div className="rise rise-3 mt-10 flex flex-col gap-4 sm:flex-row">
              <Link href="/contact" className="btn btn-brass">
                Plan your visit
              </Link>
              <Link href={latest ? `/sermons/${latest.id}` : "/sermons"} className="btn btn-light">
                {latest ? "Latest sermon" : "Sermons"}
              </Link>
            </div>
          </div>
          <div className="arch-in lg:col-span-5">
            <ArchImage
              src={images.hero.src ?? "/images/hero-green.jpg"}
              alt={images.hero.alt}
              sizes="(min-width: 1024px) 34vw, 20rem"
              priority
              onDark
              className="mx-auto w-full max-w-[17rem] sm:max-w-xs lg:max-w-[26rem]"
            />
          </div>
        </div>
      </section>

      {/* ── The bulletin card, laid over the edge of the hero ── */}
      <section className="relative z-10 -mt-28 px-5 sm:px-8 lg:-mt-40" aria-label="Service times">
        <div className="mx-auto max-w-3xl">
          <Gatherings services={services} settings={settings} />
        </div>
      </section>

      {/* ── Welcome ── */}
      <section className="mx-auto grid max-w-7xl items-center gap-16 px-5 py-20 sm:px-8 lg:grid-cols-12 lg:py-28">
        <div className="order-last lg:order-first lg:col-span-5">
          <ArchImage
            src={images.welcome.src ?? "/images/doors-green.jpg"}
            alt={images.welcome.alt}
            sizes="(min-width: 1024px) 28vw, 18rem"
            className="mx-auto w-full max-w-[16rem] sm:max-w-xs lg:max-w-sm"
          />
        </div>
        <div className="lg:col-span-7 lg:pl-6">
          <p className="eyebrow text-brass-700">Welcome</p>
          <h2 className={`mt-4 ${sectionTitle}`}>{settings.welcomeHeading}</h2>
          <Prose text={settings.welcomeBody} className="mt-6 max-w-xl text-lg text-ink-soft" />
          <Scripture cite="Psalm 122:1" className="mt-10 max-w-xl border-l border-brass-500 pl-6">
            I was glad when they said unto me, Let us go into the house of the LORD.
          </Scripture>
          <Link href="/about" className="link-rule mt-8 text-night-700">
            About the ministry <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      {/* ── Latest sermon ── */}
      {latest ? (
        <section className="bg-night-900 text-paper">
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
            <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
              <div>
                <p className="eyebrow text-brass-300">Latest sermon</p>
                <h2 className={`mt-4 ${sectionTitle}`}>
                  <Link href={`/sermons/${latest.id}`} className="transition-colors hover:text-brass-200">
                    {latest.title}
                  </Link>
                </h2>
                <p className="mt-4 font-semibold tracking-wide text-brass-300">
                  {[formatLongDate(latest.preachedOn), latest.scripture, latest.speaker].filter(Boolean).join(" · ")}
                </p>
                {paragraphs(latest.summary)[0] ? (
                  <p className="mt-6 line-clamp-4 max-w-xl text-lg text-paper/80">{paragraphs(latest.summary)[0]}</p>
                ) : null}
                <div className="mt-9 flex flex-col gap-4 sm:flex-row">
                  <Link href={`/sermons/${latest.id}`} className="btn btn-brass">
                    {latest.videoUrl ? "Watch this sermon" : "Read this sermon"}
                  </Link>
                  <Link href="/sermons" className="btn btn-light">
                    All sermons
                  </Link>
                </div>
              </div>
              <div className="relative ml-3 mt-3">
                <div aria-hidden="true" className="absolute -left-3 -top-3 h-full w-full border border-brass-300/40" />
                <div className="relative aspect-[3/2] overflow-hidden bg-night-800">
                  <Image
                    src={images.sermon.src ?? "/images/bible-green.jpg"}
                    alt={images.sermon.alt}
                    unoptimized={images.sermon.custom}
                    fill
                    sizes="(min-width: 1024px) 45vw, 92vw"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>

            {earlier.length > 0 ? (
              <ul className="mt-16 grid gap-x-20 gap-y-8 border-t border-paper/15 pt-10 md:grid-cols-2">
                {earlier.map((sermon) => (
                  <li key={sermon.id} className="flex gap-5">
                    <DateTile iso={sermon.preachedOn} onDark />
                    <div className="min-w-0">
                      <h3 className="text-2xl">
                        <Link href={`/sermons/${sermon.id}`} className="transition-colors hover:text-brass-200">
                          {sermon.title}
                        </Link>
                      </h3>
                      <p className="mt-2 text-[0.98rem] text-night-300">
                        {[formatMediumDate(sermon.preachedOn), sermon.scripture].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* ── Events ── */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow text-brass-700">Coming up</p>
            <h2 className={`mt-4 ${sectionTitle}`}>On the calendar</h2>
          </div>
          {events.length > 0 ? (
            <Link href="/events" className="link-rule text-night-700">
              All events <span aria-hidden="true">→</span>
            </Link>
          ) : null}
        </div>
        {events.length > 0 ? (
          <ul className="mt-10 border-t border-rule">
            {events.map((event) => (
              <EventRow key={event.id} event={event} />
            ))}
          </ul>
        ) : (
          <p className="mt-8 max-w-xl text-lg text-ink-soft">
            Nothing special is on the calendar right now. You are always welcome at any of our regular services.
          </p>
        )}
      </section>

      <GalleryTeaser photos={gallery} />

      {/* ── Prayer ── */}
      <section className="glow-up relative overflow-hidden text-paper">
        <ArchLines className="pointer-events-none absolute bottom-0 left-1/2 h-[94%] w-auto -translate-x-1/2 text-brass-300/25" />
        <div className="relative mx-auto max-w-3xl px-5 py-24 text-center sm:px-8 lg:py-32">
          <Scripture cite="Matthew 18:20" onDark>
            For where two or three are gathered together in my name, there am I in the midst of them.
          </Scripture>
          <h2 className={`mt-12 ${sectionTitle}`}>How can we pray for you?</h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-paper/80">
            Tell us what you are carrying. Your request goes straight to our ministry team.
          </p>
          <Link href="/prayer" className="btn btn-brass mt-9">
            Send a prayer request
          </Link>
        </div>
      </section>
    </>
  );
}
