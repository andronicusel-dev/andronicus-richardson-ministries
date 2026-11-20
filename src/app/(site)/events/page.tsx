import type { Metadata } from "next";
import Link from "next/link";
import { EventRow } from "@/components/lists";
import { PageHero } from "@/components/ui";
import { getUpcomingEvents } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Events",
  description: "Upcoming services, gatherings and special occasions at Andronicus Richardson Ministries.",
};

export default async function EventsPage() {
  const events = await getUpcomingEvents();

  return (
    <>
      <PageHero
        eyebrow="Events"
        title="On the Calendar"
        lead="Special services and gatherings coming up at the ministry. Everyone is welcome."
      />

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-24">
        {events.length > 0 ? (
          <ul className="border-t border-rule">
            {events.map((event) => (
              <EventRow key={event.id} event={event} as="h2" />
            ))}
          </ul>
        ) : (
          <div className="max-w-xl">
            <h2 className="text-3xl">Nothing special is scheduled right now.</h2>
            <p className="mt-4 text-lg text-ink-soft">
              New events are added here as they are planned. You are always welcome at our regular services.
            </p>
          </div>
        )}

        <div className="mt-14">
          <Link href="/contact" className="btn btn-ink">
            Service times &amp; contact
          </Link>
        </div>
      </section>
    </>
  );
}
