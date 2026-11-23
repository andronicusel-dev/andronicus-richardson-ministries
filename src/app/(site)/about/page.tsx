import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Gatherings, PageHero, Prose, Scripture } from "@/components/ui";
import { getServiceTimes, getSettings, getUploadedImages, uploadedSrc } from "@/lib/data";
import { paragraphs } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About",
  description: "Who we are and what to expect when you visit Andronicus Richardson Ministries.",
};

export default async function AboutPage() {
  const [settings, services, uploads] = await Promise.all([getSettings(), getServiceTimes(), getUploadedImages()]);
  const pewsSrc = uploadedSrc(uploads, "pews");
  const leaderSrc = uploadedSrc(uploads, "leader");
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
                src={pewsSrc}
                alt="Well-worn hymnals tucked into the rack of a wooden pew in warm window light"
                fill
                sizes="(min-width: 1024px) 38vw, 92vw"
                unoptimized={pewsSrc.startsWith("/media/")}
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {settings.leaderName ? (
        <section className="bg-paper-deep">
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-20 sm:px-8 lg:grid-cols-12 lg:gap-16 lg:py-24">
            {leaderSrc ? (
              <div className="relative ml-3 mt-3 lg:col-span-4">
                <div aria-hidden="true" className="absolute -left-3 -top-3 h-full w-full border border-brass-500/60" />
                <div className="relative aspect-[4/5] overflow-hidden bg-night-800">
                  <Image
                    src={leaderSrc}
                    alt={`Portrait of ${settings.leaderName}`}
                    fill
                    sizes="(min-width: 1024px) 30vw, 92vw"
                    unoptimized={leaderSrc.startsWith("/media/")}
                    className="object-cover"
                  />
                </div>
              </div>
            ) : null}
            <div className={leaderSrc ? "lg:col-span-8" : "lg:col-span-12"}>
              <p className="eyebrow text-brass-700">{settings.leaderTitle || "Leadership"}</p>
              <h2 className="mt-4 text-[clamp(2rem,4.6vw,3.4rem)]">{settings.leaderName}</h2>
              {settings.leaderBio ? (
                <Prose text={settings.leaderBio} className="mt-6 max-w-2xl text-lg text-ink-soft" />
              ) : null}
            </div>
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
