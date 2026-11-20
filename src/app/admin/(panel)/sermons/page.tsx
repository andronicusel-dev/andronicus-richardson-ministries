import { deleteSermon, saveSermon } from "@/app/actions/admin";
import { ActionForm, ConfirmAction } from "@/components/admin-client";
import { AField, AdminCard, AdminTitle, EmptyNote, StarterBadge } from "@/components/admin-ui";
import { requireAdmin } from "@/lib/auth";
import { getSermons, type Sermon } from "@/lib/data";
import { formatMediumDate, todayISO } from "@/lib/format";

export const dynamic = "force-dynamic";

function SermonFields({ sermon }: { sermon?: Sermon }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {sermon ? <input type="hidden" name="id" value={sermon.id} /> : null}
      <AField label="Title" name="title" required maxLength={200} defaultValue={sermon?.title} className="sm:col-span-2" />
      <AField label="Date preached" name="preachedOn" type="date" required defaultValue={sermon?.preachedOn ?? todayISO()} />
      <AField label="Scripture" name="scripture" placeholder="John 3:16" maxLength={120} defaultValue={sermon?.scripture} />
      <AField label="Speaker" name="speaker" maxLength={120} defaultValue={sermon?.speaker} />
      <AField
        label="Video link"
        name="videoUrl"
        placeholder="Paste a YouTube or Facebook link"
        hint="YouTube and Facebook videos play right on the sermon page. Other links open in a new tab."
        defaultValue={sermon?.videoUrl}
      />
      <AField
        label="Summary or notes"
        name="summary"
        rows={6}
        hint="Leave an empty line between paragraphs."
        defaultValue={sermon?.summary}
        className="sm:col-span-2"
      />
    </div>
  );
}

export default async function AdminSermonsPage() {
  await requireAdmin();
  const sermons = await getSermons();

  return (
    <>
      <AdminTitle title="Sermons">The newest sermon is featured on your home page automatically.</AdminTitle>

      <AdminCard title="Post a sermon">
        <ActionForm action={saveSermon} submitLabel="Post sermon" pendingLabel="Posting…" resetOnSuccess>
          <SermonFields />
        </ActionForm>
      </AdminCard>

      <h2 className="mb-4 mt-10 font-sans text-xl font-bold">On your site now</h2>
      {sermons.length === 0 ? (
        <EmptyNote>No sermons yet. Post your first one with the form above.</EmptyNote>
      ) : (
        <ul className="space-y-4">
          {sermons.map((sermon) => (
            <li key={sermon.id} className="a-card p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="flex flex-wrap items-center gap-2 font-sans text-lg font-bold">
                    {sermon.title}
                    {sermon.isSample ? <StarterBadge /> : null}
                  </h3>
                  <p className="mt-1 text-[0.95rem] text-ink-soft">
                    {[formatMediumDate(sermon.preachedOn), sermon.scripture, sermon.speaker].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <a href={`/sermons/${sermon.id}`} target="_blank" rel="noopener" className="a-btn-quiet">
                    View on site
                  </a>
                  <ConfirmAction action={deleteSermon} fields={{ id: sermon.id }} question="Delete this sermon?" />
                </div>
              </div>
              <details className="mt-4">
                <summary className="a-btn-quiet list-none [&::-webkit-details-marker]:hidden">Edit this sermon</summary>
                <div className="mt-4 border-t border-rule pt-5">
                  <ActionForm action={saveSermon} submitLabel="Save changes">
                    <SermonFields sermon={sermon} />
                  </ActionForm>
                </div>
              </details>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
