import Link from "next/link";
import { clearSampleContent } from "@/app/actions/admin";
import { ConfirmAction } from "@/components/admin-client";
import { AdminCard, AdminTitle } from "@/components/admin-ui";
import { requireAdmin } from "@/lib/auth";
import { DEFAULT_COPY, getAdminOverview, getInboxCounts, getServiceTimes, getSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  await requireAdmin();
  const [settings, services, overview, counts] = await Promise.all([
    getSettings(),
    getServiceTimes(),
    getAdminOverview(),
    getInboxCounts(),
  ]);

  const starterParts = [
    overview.sampleServices ? `${overview.sampleServices} service time${overview.sampleServices === 1 ? "" : "s"}` : "",
    overview.sampleSermons ? `${overview.sampleSermons} sermon${overview.sampleSermons === 1 ? "" : "s"}` : "",
    overview.sampleEvents ? `${overview.sampleEvents} event${overview.sampleEvents === 1 ? "" : "s"}` : "",
    overview.sampleGallery ? `${overview.sampleGallery} gallery photo${overview.sampleGallery === 1 ? "" : "s"}` : "",
  ].filter(Boolean);

  const steps = [
    {
      done: Boolean(settings.address || settings.phone || settings.email),
      label: "Add your address, phone number and email",
      href: "/admin/settings#contact",
    },
    {
      done: services.length > 0 && overview.sampleServices === 0,
      label: "Set your real service times",
      href: "/admin/services",
    },
    {
      done: settings.welcomeBody !== DEFAULT_COPY.welcomeBody && settings.aboutBody !== DEFAULT_COPY.aboutBody,
      label: "Rewrite the welcome and About wording in your own words",
      href: "/admin/settings",
    },
    { done: overview.ownSermons > 0, label: "Post your first sermon", href: "/admin/sermons" },
    { done: overview.ownUpcomingEvents > 0, label: "Add an upcoming event", href: "/admin/events" },
    { done: Boolean(settings.givingUrl), label: "Add your online giving link", href: "/admin/settings#giving" },
  ];
  const doneCount = steps.filter((step) => step.done).length;

  const stats = [
    { label: "New prayer requests", value: counts.newPrayers, href: "/admin/prayer" },
    { label: "Unread messages", value: counts.unreadMessages, href: "/admin/messages" },
    { label: "Sermons on the site", value: overview.sermons, href: "/admin/sermons" },
    { label: "Upcoming events", value: overview.upcomingEvents, href: "/admin/events" },
  ];

  return (
    <>
      <AdminTitle title="Overview">Everything on your website can be changed from the tabs above.</AdminTitle>

      {starterParts.length > 0 ? (
        <div className="mb-8 rounded-md border border-brass-500/50 bg-[#f7f2da] p-5 sm:p-6">
          <h2 className="font-sans text-lg font-bold">Your site is showing starter examples</h2>
          <p className="mb-4 mt-1 max-w-3xl text-ink">
            To show how the site looks when it is full, we added {starterParts.join(", ").replace(/, ([^,]*)$/, " and $1")}.
            They are made up. Edit each one to make it yours, or remove them all at once.
          </p>
          <ConfirmAction
            action={clearSampleContent}
            label="Remove all starter examples"
            question="Remove every starter example from the site?"
            confirmLabel="Yes, remove them"
          />
        </div>
      ) : null}

      <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <li key={stat.label}>
            <Link href={stat.href} className="a-card block h-full p-5 transition-colors hover:border-night-600">
              <span className="block font-sans text-4xl font-bold tabular-nums text-night-700">{stat.value}</span>
              <span className="mt-1 block text-[0.95rem] text-ink-soft">{stat.label}</span>
            </Link>
          </li>
        ))}
      </ul>

      <AdminCard title="Getting your site ready" className="mt-8">
        <p className="-mt-3 mb-4 text-ink-soft">
          {doneCount === steps.length
            ? "Everything on this list is done."
            : `${doneCount} of ${steps.length} done. Each line takes you to the right place.`}
        </p>
        <ul className="divide-y divide-rule border-y border-rule">
          {steps.map((step) => (
            <li key={step.label}>
              <Link href={step.href} className="flex min-h-14 items-center gap-4 py-3 hover:text-night-600">
                <span
                  aria-hidden="true"
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-sm font-bold ${
                    step.done ? "border-good bg-good text-white" : "border-ink/30 text-transparent"
                  }`}
                >
                  ✓
                </span>
                <span className={step.done ? "text-ink-soft line-through decoration-ink/30" : "font-semibold"}>
                  {step.label}
                </span>
                <span className="sr-only">{step.done ? "(done)" : "(to do)"}</span>
                <span aria-hidden="true" className="ml-auto text-ink-soft">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </AdminCard>
    </>
  );
}
