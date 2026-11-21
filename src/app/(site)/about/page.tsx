import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Gatherings, PageHero, Prose, Scripture } from "@/components/ui";
import { getServiceTimes, getSettings } from "@/lib/data";
import { paragraphs } from "@/lib/format";
import { getSiteImages } from "@/lib/site-images";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About",
  description: "Who we are and what to expect when you visit Andronicus Richardson Ministries.",
};

export default async function AboutPage() {
  const [settings, services, images] = await Promise.all([getSettings(), getServiceTimes(), getSiteImages()]);
  const [lede, ...rest] = paragraphs(settings.aboutBody);

  return (
    <>
      <PageHero eyebrow="About" title="About the Ministry" lead={settings.tagline} />

      <section className="mx-auto grid max-w-7xl gap-14 px-5 py-20 sm:px-8 lg:grid-cols-12 lg:gap-16 lg:py-28">
        <div className="lg:col-span-7">
          {lede ? <p className="font-serif text-[1.6rem] leading-snug sm:text-[1.95rem]">{lede}</p> : null}
          {rest.length > 0 ? (
            <div className="prose-body mt-8 max-w-2xl text-lg text-ink-soft">
              {rest.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          ) : null}
          <Scripture cite="Psalm 133:1" className="mt-12 max-w-xl border-l border-brass-500 pl-6">
            Behold, how good and how pleasant it is for brethren to dwell together in unity!
          </Scripture>
        </div>
        <div className="lg:col-span-5">
          <div className="relative ml-3 mt-3">
            <div aria-hidden="true" className="absolute -left-3 -top-3 h-full w-full border border-brass-500/60" />
            <div className="relative aspect-[4/5] overflow-hidden bg-night-800">
              <Image
                src={images.about.src ?? "/images/doors-green.jpg"}
                alt={images.about.alt}
                unoptimized={images.about.custom}
                fill
                sizes="(min-width: 1024px) 38vw, 92vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {settings.leaderName ? (
        <section className="bg-paper-deep">
          <div className="mx-auto grid max-w-7xl gap-8 px-5 py-20 sm:px-8 lg:grid-cols-12 lg:gap-16 lg:py-24">
            <div className="lg:col-span-5">
              <p className="eyebrow text-brass-700">{settings.leaderTitle || "Leadership"}</p>
              <h2 className="mt-4 text-[clamp(2rem,4.6vw,3.4rem)]">{settings.leaderName}</h2>
            </div>
            {settings.leaderBio ? (
              <Prose text={settings.leaderBio} className="max-w-2xl text-lg text-ink-soft lg:col-span-7 lg:pt-2" />
            ) : null}
          </div>
        </section>
      ) : null}

      <section className="px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-3xl">
          <Gatherings services={services} settings={settings} />
          <p className="mt-10 text-center text-lg text-ink-soft">
            Have a question before you come?{" "}
            <Link href="/contact" className="font-semibold text-night-700 underline underline-offset-4 hover:text-night-600">
              Send us a message
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  );
}
