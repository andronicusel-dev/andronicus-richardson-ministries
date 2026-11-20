import { deletePrayerRequest, setPrayerStatus } from "@/app/actions/admin";
import { ConfirmAction, LocalTime, QuickAction } from "@/components/admin-client";
import { AdminTitle, EmptyNote } from "@/components/admin-ui";
import { requireAdmin } from "@/lib/auth";
import { getPrayerRequests } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminPrayerPage() {
  await requireAdmin();
  const all = await getPrayerRequests();
  const requests = [...all.filter((r) => r.status === "new"), ...all.filter((r) => r.status !== "new")];

  return (
    <>
      <AdminTitle title="Prayer requests">
        Requests sent from the Prayer page of your website. Only people signed in here can see them.
      </AdminTitle>

      {requests.length === 0 ? (
        <EmptyNote>No prayer requests yet. When someone sends one from the website, it will appear here.</EmptyNote>
      ) : (
        <ul className="space-y-4">
          {requests.map((request) => (
            <li key={request.id} className="a-card p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="mr-1 font-sans text-lg font-bold">{request.name || "Name not given"}</h2>
                {request.status === "new" ? (
                  <span className="a-badge a-badge-new">New</span>
                ) : (
                  <span className="a-badge">Prayed for</span>
                )}
                {request.confidential ? <span className="a-badge a-badge-brass">Confidential</span> : null}
                {request.wantsContact ? <span className="a-badge a-badge-new">Wants to be contacted</span> : null}
                <span className="ml-auto text-[0.9rem] text-ink-soft">
                  <LocalTime iso={request.createdAt.toISOString()} />
                </span>
              </div>
              <p className="mt-3 whitespace-pre-wrap break-words">{request.request}</p>
              {request.email || request.phone ? (
                <p className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-[0.95rem]">
                  {request.email ? (
                    <a href={`mailto:${request.email}`} className="break-all font-semibold text-night-700 underline underline-offset-2">
                      {request.email}
                    </a>
                  ) : null}
                  {request.phone ? (
                    <a href={`tel:${request.phone.replace(/[^\d+]/g, "")}`} className="font-semibold text-night-700 underline underline-offset-2">
                      {request.phone}
                    </a>
                  ) : null}
                </p>
              ) : null}
              <div className="mt-4 flex flex-wrap gap-2">
                <QuickAction
                  action={setPrayerStatus}
                  fields={{ id: request.id, status: request.status === "new" ? "prayed" : "new" }}
                >
                  {request.status === "new" ? "Mark as prayed for" : "Mark as new again"}
                </QuickAction>
                <ConfirmAction
                  action={deletePrayerRequest}
                  fields={{ id: request.id }}
                  question="Delete this request for good?"
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
