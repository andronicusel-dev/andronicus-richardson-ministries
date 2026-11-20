"use client";

import {
  startTransition,
  useActionState,
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { submitContactMessage, submitPrayerRequest } from "@/app/actions/public";
import type { FormState } from "@/lib/validate";

type Action = (state: FormState, formData: FormData) => Promise<FormState>;

/**
 * Submits through a server action without letting React clear the form afterwards, so
 * nobody loses what they typed when one field needs fixing.
 */
function useSubmit(action: Action) {
  const [state, dispatch, pending] = useActionState(action, null);
  const formRef = useRef<HTMLFormElement>(null);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => dispatch(formData));
  };

  useEffect(() => {
    if (state && !state.ok && state.errors) {
      formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
    }
  }, [state]);

  return { state, dispatch, pending, onSubmit, formRef };
}

function TextField({
  label,
  name,
  type = "text",
  required = false,
  autoComplete,
  error,
  hint,
  showOptional = true,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  error?: string;
  hint?: string;
  showOptional?: boolean;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
        {required || !showOptional ? null : <span className="field-optional"> (optional)</span>}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className="field-input"
      />
      {hint && !error ? (
        <p id={`${id}-hint`} className="field-hint">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="field-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function TextArea({
  label,
  name,
  rows = 6,
  required = false,
  error,
  maxLength = 4000,
}: {
  label: string;
  name: string;
  rows?: number;
  required?: boolean;
  error?: string;
  maxLength?: number;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <textarea
        id={id}
        name={name}
        rows={rows}
        required={required}
        maxLength={maxLength}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className="field-input resize-y leading-relaxed"
      />
      {error ? (
        <p id={`${id}-error`} className="field-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function Check({ name, label, hint }: { name: string; label: string; hint?: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 py-1">
      <input type="checkbox" name={name} className="mt-1 h-5 w-5 shrink-0 accent-night-700" />
      <span>
        <span className="font-semibold">{label}</span>
        {hint ? <span className="block text-[0.95rem] text-ink-soft">{hint}</span> : null}
      </span>
    </label>
  );
}

/** Hidden from people; bots that fill every field give themselves away. */
function Honeypot() {
  return (
    <div aria-hidden="true" className="hidden">
      <label>
        Website
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  );
}

function FormProblem({ state }: { state: FormState }) {
  return (
    <p role="alert" className={state && !state.ok ? "field-error border-l-2 border-alert pl-3" : "sr-only"}>
      {state && !state.ok ? state.message : ""}
    </p>
  );
}

function Sent({
  title,
  children,
  againLabel,
  onAgain,
}: {
  title: string;
  children: ReactNode;
  againLabel: string;
  onAgain: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.focus();
  }, []);
  return (
    <div ref={ref} tabIndex={-1} role="status" className="bg-card p-1.5 outline-none ring-1 ring-rule">
      <div className="border border-brass-700/35 px-6 py-10 sm:px-10">
        <p className="eyebrow text-brass-700">Received</p>
        <h2 className="mt-3 text-3xl sm:text-4xl">{title}</h2>
        <div className="mt-4 text-lg text-ink-soft">{children}</div>
        <button type="button" onClick={onAgain} className="link-rule mt-6 text-night-700">
          {againLabel}
        </button>
      </div>
    </div>
  );
}

/* ───────────────────────── Prayer request ───────────────────────── */

export function PrayerForm() {
  const [round, setRound] = useState(0);
  return <PrayerFormFields key={round} onAgain={() => setRound((value) => value + 1)} />;
}

function PrayerFormFields({ onAgain }: { onAgain: () => void }) {
  const { state, dispatch, pending, onSubmit, formRef } = useSubmit(submitPrayerRequest);

  if (state?.ok) {
    return (
      <Sent title={state.message} againLabel="Send another request" onAgain={onAgain}>
        <p>Your prayer request has reached our ministry team. You are not carrying this alone.</p>
      </Sent>
    );
  }

  const errors = state?.errors ?? {};
  return (
    <form ref={formRef} action={dispatch} onSubmit={onSubmit} className="space-y-6">
      <TextArea label="How can we pray for you?" name="request" required rows={7} error={errors.request} />
      <div className="grid gap-6 sm:grid-cols-2">
        <TextField label="Your name" name="name" autoComplete="name" />
        <TextField label="Phone" name="phone" type="tel" autoComplete="tel" />
      </div>
      <TextField label="Email" name="email" type="email" autoComplete="email" error={errors.email} />
      <fieldset className="space-y-2">
        <legend className="sr-only">How we should handle your request</legend>
        <Check
          name="confidential"
          label="Please keep this confidential"
          hint="It will not be shared beyond the ministry's leadership."
        />
        <Check name="wantsContact" label="I would like someone to contact me" />
      </fieldset>
      <Honeypot />
      <FormProblem state={state} />
      <button type="submit" disabled={pending} className="btn btn-ink w-full sm:w-auto">
        {pending ? "Sending…" : "Send prayer request"}
      </button>
    </form>
  );
}

/* ───────────────────────── Contact ───────────────────────── */

const TOPICS = ["Planning a visit", "A question about the ministry", "Speaking with a minister", "Something else"];

export function ContactForm() {
  const [round, setRound] = useState(0);
  return <ContactFormFields key={round} onAgain={() => setRound((value) => value + 1)} />;
}

function ContactFormFields({ onAgain }: { onAgain: () => void }) {
  const { state, dispatch, pending, onSubmit, formRef } = useSubmit(submitContactMessage);
  const topicId = useId();

  if (state?.ok) {
    return (
      <Sent title={state.message} againLabel="Send another message" onAgain={onAgain}>
        <p>Your message has been delivered to the ministry. Someone will be in touch with you.</p>
      </Sent>
    );
  }

  const errors = state?.errors ?? {};
  return (
    <form ref={formRef} action={dispatch} onSubmit={onSubmit} className="space-y-6">
      <TextField label="Your name" name="name" required autoComplete="name" error={errors.name} />
      <div className="grid gap-6 sm:grid-cols-2">
        <TextField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          error={errors.email}
          hint="Leave an email or a phone number so we can reply."
          showOptional={false}
        />
        <TextField label="Phone" name="phone" type="tel" autoComplete="tel" showOptional={false} />
      </div>
      <div>
        <label htmlFor={topicId} className="field-label">
          What is this about?
        </label>
        <select id={topicId} name="topic" defaultValue={TOPICS[0]} className="field-input">
          {TOPICS.map((topic) => (
            <option key={topic}>{topic}</option>
          ))}
        </select>
      </div>
      <TextArea label="Your message" name="message" required rows={6} error={errors.message} />
      <Honeypot />
      <FormProblem state={state} />
      <button type="submit" disabled={pending} className="btn btn-ink w-full sm:w-auto">
        {pending ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
