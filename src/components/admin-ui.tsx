import type { ReactNode } from "react";

export function AdminTitle({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="mb-8">
      <h1 className="font-sans text-[1.75rem] font-bold leading-tight">{title}</h1>
      {children ? <p className="mt-2 max-w-2xl text-ink-soft">{children}</p> : null}
    </div>
  );
}

export function AdminCard({
  title,
  children,
  id,
  className = "",
}: {
  title?: string;
  children: ReactNode;
  id?: string;
  className?: string;
}) {
  return (
    <section id={id} className={`a-card scroll-mt-6 p-5 sm:p-7 ${className}`}>
      {title ? <h2 className="mb-5 font-sans text-xl font-bold">{title}</h2> : null}
      {children}
    </section>
  );
}

export function AField({
  label,
  name,
  defaultValue = "",
  type = "text",
  required = false,
  hint,
  placeholder,
  rows,
  maxLength,
  autoComplete,
  className = "",
}: {
  label: string;
  name: string;
  defaultValue?: string | number;
  type?: string;
  required?: boolean;
  hint?: string;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
  autoComplete?: string;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="a-label">
        {label}
        {required ? null : <span className="a-optional"> (optional)</span>}
      </span>
      {rows ? (
        <textarea
          name={name}
          defaultValue={defaultValue}
          rows={rows}
          required={required}
          placeholder={placeholder}
          maxLength={maxLength}
          className="a-input resize-y leading-relaxed"
        />
      ) : (
        <input
          name={name}
          type={type}
          defaultValue={defaultValue}
          required={required}
          placeholder={placeholder}
          maxLength={maxLength}
          autoComplete={autoComplete}
          className="a-input"
        />
      )}
      {hint ? <span className="a-hint">{hint}</span> : null}
    </label>
  );
}

export function StarterBadge() {
  return <span className="a-badge a-badge-brass">Starter example</span>;
}

export function EmptyNote({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-md border border-dashed border-rule bg-white/60 px-5 py-8 text-center text-ink-soft">
      {children}
    </p>
  );
}
