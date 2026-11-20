import { deleteEvent, saveEvent } from "@/app/actions/admin";
import { ActionForm, ConfirmAction } from "@/components/admin-client";
import { AField, AdminCard, AdminTitle, EmptyNote, StarterBadge } from "@/components/admin-ui";
import { requireAdmin } from "@/lib/auth";
import { getAllEvents, isUpcoming, type ChurchEvent } from "@/lib/data";
import { formatLongDate } from "@/lib/format";

export const dynamic = "force-dynamic";

function EventFields({ event }: { event?: ChurchEvent }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {event ? <input type="hidden" name="id" value={event.id} /> : null}
      <AField label="Event name" name="title" required maxLength={200} defaultValue={event?.title} className="sm:col-span-2" />
      <AField label="Date" name="eventDate" type="date" required defaultValue={event?.eventDate} />
      <AField label="Time" name="timeText" placeholder="7:00 PM" maxLength={80} defaultValue={event?.timeText} />
      <AField
        label="Location"
        name="location"
        placeholder="Fellowship hall, or a street address"
        maxLength={200}
        defaultValue={event?.location}
        className="sm:col-span-2"
      />
      <AField
        label="Details"
        name="description"
        rows={4}
        hint="Leave an empty line between paragraphs."
        defaultValue={event?.description}
        className="sm:col-span-2"
      />
    </div>
  );
}

export default async function AdminEventsPage() {
  await requireAdmin();
  const events = await getAllEvents();
  const upcoming = events.filter(isUpcoming).reverse();
  const past = events.filter((event) => !isUpcoming(event));

  const renderList = (list: ChurchEvent[]) => (
    <ul className="space-y-4">
      {list.map((event) => (
        <li key={event.id} className="a-card p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="flex flex-wrap items-center gap-2 font-sans text-lg font-bold">
                {event.title}
                {event.isSample ? <StarterBadge /> : null}
              </h3>
              <p className="mt-1 text-[0.95rem] text-ink-soft">
                {[formatLongDate(event.eventDate), event.timeText, event.location].filter(Boolean).join(" · ")}
              </p>
            </div>
            <ConfirmAction action={deleteEvent} fields={{ id: event.id }} question="Delete this event?" />
          </div>
          <details className="mt-4">
            <summary className="a-btn-quiet list-none [&::-webkit-details-marker]:hidden">Edit this event</summary>
            <div className="mt-4 border-t border-rule pt-5">
              <ActionForm action={saveEvent} submitLabel="Save changes">
                <EventFields event={event} />
              </ActionForm>
            </div>
          </details>
        </li>
      ))}
    </ul>
  );

  return (
    <>
      <AdminTitle title="Events">
        Upcoming events show on your home page and Events page. They come off the site by themselves once the date
        has passed.
      </AdminTitle>

      <AdminCard title="Add an event">
        <ActionForm action={saveEvent} submitLabel="Add event" pendingLabel="Adding…" resetOnSuccess>
          <EventFields />
        </ActionForm>
      </AdminCard>

      <h2 className="mb-4 mt-10 font-sans text-xl font-bold">Upcoming</h2>
      {upcoming.length === 0 ? (
        <EmptyNote>No upcoming events. Add one with the form above.</EmptyNote>
      ) : (
        renderList(upcoming)
      )}

      {past.length > 0 ? (
        <>
          <h2 className="mb-1 mt-10 font-sans text-xl font-bold">Past</h2>
          <p className="mb-4 text-ink-soft">No longer shown on the website. Kept here in case you want to reuse one.</p>
          {renderList(past)}
        </>
      ) : null}
    </>
  );
}
