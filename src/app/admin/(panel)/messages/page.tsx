import { deleteMessage, setMessageRead } from "@/app/actions/admin";
import { ConfirmAction, LocalTime, QuickAction } from "@/components/admin-client";
import { AdminTitle, EmptyNote } from "@/components/admin-ui";
import { requireAdmin } from "@/lib/auth";
import { getContactMessages } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  await requireAdmin();
  const all = await getContactMessages();
  const messages = [...all.filter((m) => !m.isRead), ...all.filter((m) => m.isRead)];

  return (
    <>
      <AdminTitle title="Messages">
        Messages sent from the Visit &amp; contact page. Reply by email or phone using the details each person left.
      </AdminTitle>

      {messages.length === 0 ? (
        <EmptyNote>No messages yet. When someone writes to you from the website, it will appear here.</EmptyNote>
      ) : (
        <ul className="space-y-4">
          {messages.map((message) => (
            <li key={message.id} className="a-card p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="mr-1 font-sans text-lg font-bold">{message.name}</h2>
                {message.isRead ? <span className="a-badge">Read</span> : <span className="a-badge a-badge-new">New</span>}
                {message.topic ? <span className="a-badge a-badge-brass">{message.topic}</span> : null}
                <span className="ml-auto text-[0.9rem] text-ink-soft">
                  <LocalTime iso={message.createdAt.toISOString()} />
                </span>
              </div>
              <p className="mt-3 whitespace-pre-wrap break-words">{message.message}</p>
              <p className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-[0.95rem]">
                {message.email ? (
                  <a href={`mailto:${message.email}`} className="break-all font-semibold text-night-700 underline underline-offset-2">
                    {message.email}
                  </a>
                ) : null}
                {message.phone ? (
                  <a href={`tel:${message.phone.replace(/[^\d+]/g, "")}`} className="font-semibold text-night-700 underline underline-offset-2">
                    {message.phone}
                  </a>
                ) : null}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <QuickAction action={setMessageRead} fields={{ id: message.id, read: message.isRead ? "false" : "true" }}>
                  {message.isRead ? "Mark as unread" : "Mark as read"}
                </QuickAction>
                <ConfirmAction action={deleteMessage} fields={{ id: message.id }} question="Delete this message for good?" />
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
