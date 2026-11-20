import { deleteServiceTime, saveServiceTime } from "@/app/actions/admin";
import { ActionForm, ConfirmAction } from "@/components/admin-client";
import { AField, AdminCard, AdminTitle, EmptyNote, StarterBadge } from "@/components/admin-ui";
import { requireAdmin } from "@/lib/auth";
import { getServiceTimes, type ServiceTime } from "@/lib/data";

export const dynamic = "force-dynamic";

function ServiceFields({ service }: { service?: ServiceTime }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {service ? <input type="hidden" name="id" value={service.id} /> : null}
      <AField
        label="Name of the service"
        name="name"
        required
        maxLength={120}
        placeholder="Sunday Morning Worship"
        defaultValue={service?.name}
        className="sm:col-span-2"
      />
      <AField label="Day" name="day" required maxLength={80} placeholder="Sundays" defaultValue={service?.day} />
      <AField label="Time" name="time" required maxLength={80} placeholder="10:00 AM" defaultValue={service?.time} />
      <AField
        label="Short note"
        name="note"
        maxLength={200}
        placeholder="Doors open at 9:30"
        defaultValue={service?.note}
        className={service ? "" : "sm:col-span-2"}
      />
      {service ? (
        <AField
          label="Position in the list"
          name="sortOrder"
          type="number"
          required
          defaultValue={service.sortOrder}
          hint="Lower numbers are listed first."
        />
      ) : null}
    </div>
  );
}

export default async function AdminServicesPage() {
  await requireAdmin();
  const services = await getServiceTimes();

  return (
    <>
      <AdminTitle title="Service times">
        These appear on your home page, the Visit page and at the bottom of every page.
      </AdminTitle>

      {services.length === 0 ? (
        <EmptyNote>No service times listed. Add your first one below.</EmptyNote>
      ) : (
        <ul className="space-y-4">
          {services.map((service) => (
            <li key={service.id} className="a-card p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="flex flex-wrap items-center gap-2 font-sans text-lg font-bold">
                    {service.name}
                    {service.isSample ? <StarterBadge /> : null}
                  </h2>
                  <p className="mt-1 text-[0.95rem] text-ink-soft">
                    {[`${service.day} · ${service.time}`, service.note].filter(Boolean).join(" — ")}
                  </p>
                </div>
                <ConfirmAction action={deleteServiceTime} fields={{ id: service.id }} question="Remove this service time?" confirmLabel="Yes, remove" label="Remove" />
              </div>
              <details className="mt-4">
                <summary className="a-btn-quiet list-none [&::-webkit-details-marker]:hidden">Edit</summary>
                <div className="mt-4 border-t border-rule pt-5">
                  <ActionForm action={saveServiceTime} submitLabel="Save changes">
                    <ServiceFields service={service} />
                  </ActionForm>
                </div>
              </details>
            </li>
          ))}
        </ul>
      )}

      <AdminCard title="Add a service time" className="mt-10">
        <ActionForm action={saveServiceTime} submitLabel="Add service time" pendingLabel="Adding…" resetOnSuccess>
          <ServiceFields />
        </ActionForm>
      </AdminCard>
    </>
  );
}
