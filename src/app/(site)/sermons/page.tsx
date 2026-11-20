import type { Metadata } from "next";
import Link from "next/link";
import { SermonRow } from "@/components/lists";
import { PageHero, Scripture } from "@/components/ui";
import { getSermons } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sermons",
  description: "Recent sermons from Andronicus Richardson Ministries.",
};

export default async function SermonsPage() {
  const sermons = await getSermons();

  return (
    <>
      <PageHero
        eyebrow="Sermons"
        title="Hear the Word"
        lead="Catch up on a message you missed, or return to one that spoke to you."
      />

      <section className="mx-auto max-w-5xl px-5 py-16 sm:px-8 lg:py-24">
        {sermons.length > 0 ? (
          <ul className="border-t border-rule">
            {sermons.map((sermon) => (
              <SermonRow key={sermon.id} sermon={sermon} />
            ))}
          </ul>
        ) : (
          <div className="max-w-xl">
            <h2 className="text-3xl">Sermons will be posted here.</h2>
            <p className="mt-4 text-lg text-ink-soft">
              Nothing has been added yet. The best way to hear the Word is to join us in person.
            </p>
            <Link href="/contact" className="btn btn-ink mt-8">
              See service times
            </Link>
          </div>
        )}

        <Scripture cite="Romans 10:17" className="mx-auto mt-20 max-w-2xl text-center">
          So then faith cometh by hearing, and hearing by the word of God.
        </Scripture>
      </section>
    </>
  );
}
