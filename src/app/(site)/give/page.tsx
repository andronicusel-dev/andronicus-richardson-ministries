import type { Metadata } from "next";
import Link from "next/link";
import { PageHero, Prose, Scripture } from "@/components/ui";
import { getSettings } from "@/lib/data";
import { hostnameOf } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Give",
  description: "Ways to give to Andronicus Richardson Ministries.",
};

export default async function GivePage() {
  const settings = await getSettings();
  const online = settings.givingUrl;
  const host = online ? hostnameOf(online) : "";

  return (
    <>
      <PageHero
        eyebrow="Give"
        title="Giving"
        lead="Every gift supports the work of this ministry. Thank you for your generosity."
      />

      <section className="mx-auto max-w-5xl px-5 py-16 sm:px-8 lg:py-24">
        <Scripture cite="2 Corinthians 9:7" className="max-w-3xl border-l border-brass-500 pl-6">
          Every man according as he purposeth in his heart, so let him give; not grudgingly, or of necessity: for God
          loveth a cheerful giver.
        </Scripture>

        <div className={`mt-14 grid gap-6 ${online ? "md:grid-cols-2" : ""}`}>
          {online ? (
            <div className="hero-light flex flex-col items-start p-8 text-paper sm:p-10">
              <p className="eyebrow text-brass-300">Online</p>
              <h2 className="mt-3 text-3xl">Give online</h2>
              <p className="mb-8 mt-4 text-paper/80">
                You will leave this site and finish your gift on {host || "our giving page"}.
              </p>
              <a href={online} target="_blank" rel="noopener noreferrer" className="btn btn-brass mt-auto">
                Give online <span aria-hidden="true">↗</span>
              </a>
            </div>
          ) : null}

          <div className="flex flex-col items-start border border-rule bg-card p-8 sm:p-10">
            <p className="eyebrow text-brass-700">In person</p>
            <h2 className="mt-3 text-3xl">Give at a service</h2>
            <p className="mb-6 mt-4 max-w-xl text-ink-soft">You are welcome to give during any of our services.</p>
            <Link href="/contact" className="link-rule mt-auto text-night-700">
              See service times <span aria-hidden="true">→</span>
            </Link>
          </div>

          {settings.givingNote ? (
            <div className={`border border-rule bg-card p-8 sm:p-10 ${online ? "md:col-span-2" : ""}`}>
              <p className="eyebrow text-brass-700">More ways to give</p>
              <Prose text={settings.givingNote} className="mt-4 max-w-2xl text-lg text-ink-soft" />
            </div>
          ) : null}
        </div>

        <p className="mt-12 text-lg text-ink-soft">
          Questions about giving?{" "}
          <Link href="/contact" className="font-semibold text-night-700 underline underline-offset-4 hover:text-night-600">
            Send us a message
          </Link>
          .
        </p>
      </section>
    </>
  );
}
