import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/ui";
import { getSermon } from "@/lib/data";
import { formatLongDate, hostnameOf, paragraphs, videoEmbed } from "@/lib/format";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

async function load(rawId: string) {
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) return null;
  return getSermon(id);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const sermon = await load(id);
  if (!sermon) return { title: "Sermon not found" };
  return {
    title: sermon.title,
    description: paragraphs(sermon.summary)[0]?.slice(0, 160) || `A sermon from ${formatLongDate(sermon.preachedOn)}.`,
  };
}

export default async function SermonPage({ params }: Props) {
  const { id } = await params;
  const sermon = await load(id);
  if (!sermon) notFound();

  const embed = sermon.videoUrl ? videoEmbed(sermon.videoUrl) : null;
  const [lede, ...rest] = paragraphs(sermon.summary);
  const byline = [sermon.scripture, sermon.speaker].filter(Boolean).join(" · ");

  return (
    <>
      <PageHero eyebrow={formatLongDate(sermon.preachedOn)} title={sermon.title}>
        {byline ? <p className="rise rise-2 mt-6 text-lg font-semibold tracking-wide text-brass-300">{byline}</p> : null}
      </PageHero>

      <article className="mx-auto max-w-3xl px-5 py-16 sm:px-8 lg:py-24">
        {embed ? (
          <div className="relative mb-12 aspect-video overflow-hidden bg-night-950 shadow-[0_30px_60px_-30px_rgba(11,28,18,0.6)]">
            <iframe
              src={embed.src}
              title={`Video of the sermon “${sermon.title}”`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
              className="absolute inset-0 h-full w-full border-0"
            />
          </div>
        ) : null}

        {sermon.videoUrl && !embed ? (
          <a href={sermon.videoUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ink mb-12">
            Watch or listen on {hostnameOf(sermon.videoUrl) || "another site"} <span aria-hidden="true">↗</span>
          </a>
        ) : null}

        {lede ? (
          <>
            <p className="font-serif text-[1.5rem] leading-snug sm:text-[1.8rem]">{lede}</p>
            {rest.length > 0 ? (
              <div className="prose-body mt-8 text-lg text-ink-soft">
                {rest.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            ) : null}
          </>
        ) : !sermon.videoUrl ? (
          <p className="text-lg text-ink-soft">Notes for this sermon have not been added yet.</p>
        ) : null}

        <div className="mt-14 flex flex-col gap-2 border-t border-rule pt-6 sm:flex-row sm:justify-between">
          <Link href="/sermons" className="link-rule text-night-700">
            <span aria-hidden="true">←</span> All sermons
          </Link>
          <Link href="/prayer" className="link-rule text-night-700">
            Ask for prayer <span aria-hidden="true">→</span>
          </Link>
        </div>
      </article>
    </>
  );
}
