import Link from "next/link";
import { DateTile, Prose } from "@/components/ui";
import type { ChurchEvent, Sermon } from "@/lib/data";
import { formatLongDate, formatMediumDate, paragraphs } from "@/lib/format";

export function SermonRow({ sermon }: { sermon: Sermon }) {
  const meta = [formatMediumDate(sermon.preachedOn), sermon.scripture, sermon.speaker].filter(Boolean).join(" · ");
  const excerpt = paragraphs(sermon.summary)[0];
  const verb = sermon.videoUrl ? "Watch" : "Read";
  return (
    <li className="flex gap-5 border-b border-rule py-8 sm:gap-8">
      <DateTile iso={sermon.preachedOn} />
      <div className="min-w-0 flex-1">
        <h2 className="text-[1.6rem] sm:text-3xl">
          <Link href={`/sermons/${sermon.id}`} className="transition-colors hover:text-night-600">
            {sermon.title}
          </Link>
        </h2>
        <p className="mt-2 text-[0.98rem] font-semibold tracking-wide text-brass-700">{meta}</p>
        {excerpt ? <p className="mt-3 line-clamp-3 max-w-2xl text-ink-soft">{excerpt}</p> : null}
        <Link
          href={`/sermons/${sermon.id}`}
          aria-label={`${verb} the sermon “${sermon.title}”`}
          className="link-rule mt-2 text-night-700"
        >
          {verb} <span aria-hidden="true">→</span>
        </Link>
      </div>
    </li>
  );
}

export function EventRow({ event, as: Heading = "h3" }: { event: ChurchEvent; as?: "h2" | "h3" }) {
  const when = [formatLongDate(event.eventDate), event.timeText].filter(Boolean).join(" · ");
  return (
    <li className="flex gap-5 border-b border-rule py-8 sm:gap-8">
      <DateTile iso={event.eventDate} />
      <div className="grid min-w-0 flex-1 gap-x-12 gap-y-3 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div>
          <Heading className="text-[1.6rem] sm:text-3xl">{event.title}</Heading>
          <p className="mt-2 text-[0.98rem] font-semibold tracking-wide text-brass-700">{when}</p>
          {event.location ? <p className="mt-1 text-ink-soft">{event.location}</p> : null}
        </div>
        {event.description ? <Prose text={event.description} className="text-ink-soft lg:pt-1" /> : null}
      </div>
    </li>
  );
}
