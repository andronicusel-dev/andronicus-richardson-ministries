"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { useFormStatus } from "react-dom";
import type { FormState } from "@/lib/validate";

type StateAction = (state: FormState, formData: FormData) => Promise<FormState>;
type PlainAction = (formData: FormData) => Promise<void>;

/** A form wired to a server action, with a saving state and a plain-language result message. */
export function ActionForm({
  action,
  children,
  className = "",
  submitLabel = "Save",
  pendingLabel = "Saving…",
  resetOnSuccess = false,
}: {
  action: StateAction;
  children: ReactNode;
  className?: string;
  submitLabel?: string;
  pendingLabel?: string;
  resetOnSuccess?: boolean;
}) {
  const [state, dispatch, pending] = useActionState(action, null);
  const formRef = useRef<HTMLFormElement>(null);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => dispatch(formData));
  };

  useEffect(() => {
    if (state?.ok && resetOnSuccess) formRef.current?.reset();
  }, [state, resetOnSuccess]);

  return (
    <form ref={formRef} action={dispatch} onSubmit={onSubmit} className={className}>
      {children}
      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
        <button type="submit" disabled={pending} className="a-btn">
          {pending ? pendingLabel : submitLabel}
        </button>
        <p
          role="status"
          aria-live="polite"
          className={`text-[0.95rem] font-semibold ${state?.ok ? "text-good" : "text-alert"}`}
        >
          {pending ? "" : (state?.message ?? "")}
        </p>
      </div>
    </form>
  );
}

function PendingLabel({ children, pendingLabel }: { children: ReactNode; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return <>{pending ? pendingLabel : children}</>;
}

/** A one-click action button (mark as read, etc.) that shows it is working. */
export function QuickAction({
  action,
  fields,
  children,
  pendingLabel = "Working…",
  className = "a-btn-quiet",
}: {
  action: PlainAction;
  fields: Record<string, string | number>;
  children: ReactNode;
  pendingLabel?: string;
  className?: string;
}) {
  return (
    <form action={action}>
      {Object.entries(fields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <button type="submit" className={className}>
        <PendingLabel pendingLabel={pendingLabel}>{children}</PendingLabel>
      </button>
    </form>
  );
}

/** A destructive action that asks once before it runs. */
export function ConfirmAction({
  action,
  fields = {},
  label = "Delete",
  question,
  confirmLabel = "Yes, delete",
}: {
  action: PlainAction;
  fields?: Record<string, string | number>;
  label?: string;
  question: string;
  confirmLabel?: string;
}) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button type="button" onClick={() => setConfirming(true)} className="a-btn-quiet a-btn-danger">
        {label}
      </button>
    );
  }

  return (
    <form action={action} className="flex flex-wrap items-center gap-2 rounded bg-[#fbeeec] px-3 py-2">
      {Object.entries(fields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <span className="text-[0.95rem] font-semibold text-alert">{question}</span>
      <button type="submit" className="a-btn-quiet a-btn-danger">
        <PendingLabel pendingLabel="Removing…">{confirmLabel}</PendingLabel>
      </button>
      <button type="button" onClick={() => setConfirming(false)} className="a-btn-quiet">
        Keep it
      </button>
    </form>
  );
}

/** Shows a saved timestamp in the reader's own timezone. */
export function LocalTime({ iso }: { iso: string }) {
  const [text, setText] = useState("");
  useEffect(() => {
    setText(new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }));
  }, [iso]);
  return <time dateTime={iso}>{text || iso.slice(0, 10)}</time>;
}

export function AdminNav({ newPrayers, unreadMessages }: { newPrayers: number; unreadMessages: number }) {
  const pathname = usePathname();
  const tabs = [
    { href: "/admin", label: "Overview", badge: 0 },
    { href: "/admin/prayer", label: "Prayer requests", badge: newPrayers },
    { href: "/admin/messages", label: "Messages", badge: unreadMessages },
    { href: "/admin/sermons", label: "Sermons", badge: 0 },
    { href: "/admin/events", label: "Events", badge: 0 },
    { href: "/admin/services", label: "Service times", badge: 0 },
    { href: "/admin/settings", label: "Site details", badge: 0 },
    { href: "/admin/pictures", label: "Pictures & logo", badge: 0 },
    { href: "/admin/gallery", label: "Gallery", badge: 0 },
  ];

  return (
    <nav aria-label="Admin" className="mx-auto max-w-6xl overflow-x-auto px-3 sm:px-6">
      <ul className="flex gap-1 whitespace-nowrap">
        {tabs.map((tab) => {
          const active = tab.href === "/admin" ? pathname === "/admin" : pathname.startsWith(tab.href);
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-12 items-center gap-2 border-b-2 px-3 text-[0.95rem] font-semibold transition-colors ${
                  active ? "border-brass-300 text-paper" : "border-transparent text-night-300 hover:text-paper"
                }`}
              >
                {tab.label}
                {tab.badge > 0 ? (
                  <span className="rounded-full bg-brass-300 px-2 text-xs font-bold leading-5 text-night-950">
                    {tab.badge}
                    <span className="sr-only"> new</span>
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
