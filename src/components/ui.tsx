import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import type { ServiceTime, Settings } from "@/lib/data";
import { dateParts, paragraphs } from "@/lib/format";

/** The ministry's mark: a lit doorway inside an arch. */
export function Mark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 40" fill="none" aria-hidden="true" className={className}>
      <path d="M2 39V16C2 8.27 8.27 2 16 2s14 6.27 14 14v23" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9.5 39V17a6.5 6.5 0 0 1 13 0v22z" fill="currentColor" />
    </svg>
  );
}

/** Nested arches, like the recessed mouldings around a church doorway. Decorative. */
export function ArchLines({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 300 400" fill="none" aria-hidden="true" className={className} preserveAspectRatio="xMidYMax meet">
      {[0, 30, 60, 90].map((inset) => (
        <path
          key={inset}
          d={`M${5 + inset} 400V150a${145 - inset} ${145 - inset} 0 0 1 ${290 - inset * 2} 0v250`}
          stroke="currentColor"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  );
}

/** A photograph set in an arched window with two outline arches around it. */
export function ArchImage({
  src,
  alt,
  sizes,
  priority = false,
  onDark = false,
  className = "",
}: {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  onDark?: boolean;
  className?: string;
}) {
  const near = onDark ? "border-brass-300/45" : "border-brass-500/70";
  const far = onDark ? "border-brass-300/20" : "border-brass-500/35";
  return (
    <div className={`relative ${className}`}>
      <div aria-hidden="true" className={`absolute -inset-x-3 -top-3 bottom-0 rounded-t-full border-x border-t ${near}`} />
      <div aria-hidden="true" className={`absolute -inset-x-6 -top-6 bottom-0 rounded-t-full border-x border-t ${far}`} />
      <div className="relative aspect-[3/4] overflow-hidden rounded-t-full bg-night-800">
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          unoptimized={src.startsWith("/media/")}
          className="object-cover"
        />
      </div>
    </div>
  );
}

export function Ornament({ className = "" }: { className?: string }) {
  return (
    <span aria-hidden="true" className={`flex w-28 items-center gap-3 ${className}`}>
      <span className="h-px flex-1 bg-current opacity-60" />
      <span className="h-1.5 w-1.5 rotate-45 bg-current" />
      <span className="h-px flex-1 bg-current opacity-60" />
    </span>
  );
}

/** A calendar date shown like a card slotted into a hymn board. */
export function DateTile({ iso, onDark = false }: { iso: string; onDark?: boolean }) {
  const { month, day } = dateParts(iso);
  return (
    <div
      aria-hidden="true"
      className={`flex h-[4.75rem] w-[4.25rem] shrink-0 flex-col items-center justify-center gap-1 ${
        onDark ? "bg-paper text-night-950" : "bg-night-900 text-paper"
      }`}
    >
      <span className={`text-[0.68rem] font-semibold uppercase tracking-[0.22em] ${onDark ? "text-brass-700" : "text-brass-300"}`}>
        {month}
      </span>
      <span className="font-display text-[2rem] leading-none">{day}</span>
    </div>
  );
}

/** Service times set like the printed Sunday bulletin, with dotted leaders. */
export function Gatherings({
  services,
  settings,
  showLink = true,
}: {
  services: ServiceTime[];
  settings: Settings;
  showLink?: boolean;
}) {
  const place = [settings.address, settings.cityStateZip].filter(Boolean).join(", ");
  return (
    <div className="bg-paper p-1.5 shadow-[0_40px_80px_-40px_rgba(11,28,18,0.65)] ring-1 ring-rule/80">
      <div className="border border-brass-700/35 px-6 py-10 text-center sm:px-12 sm:py-12">
        <p className="eyebrow text-brass-700">Join us</p>
        <h2 className="mt-3 text-[2rem] sm:text-[2.6rem]">When We Gather</h2>
        <Ornament className="mx-auto mt-5 text-brass-500" />

        {services.length > 0 ? (
          <ul className="mt-8 space-y-5 text-left">
            {services.map((service) => (
              <li key={service.id}>
                <div className="sm:flex sm:items-baseline sm:gap-4">
                  <span className="block font-display text-[1.35rem] leading-tight">{service.name}</span>
                  <span aria-hidden="true" className="leader hidden sm:block" />
                  <span className="mt-1 block font-semibold tracking-wide text-night-700 sm:mt-0 sm:shrink-0">
                    {service.day} · {service.time}
                  </span>
                </div>
                {service.note ? <p className="mt-1 text-[0.95rem] text-ink-soft">{service.note}</p> : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mx-auto mt-8 max-w-md text-ink-soft">
            Our service times will be posted here. Until then, send us a message and we will let you know when we
            meet.
          </p>
        )}

        {place ? (
          <p className="mt-9 border-t border-rule pt-6 text-ink-soft">
            <span className="eyebrow mr-3 text-brass-700">Where</span>
            {place}
          </p>
        ) : null}

        {showLink ? (
          <div className={place ? "mt-5" : "mt-8"}>
            <Link href="/contact" className="link-rule text-night-700">
              Plan your visit <span aria-hidden="true">→</span>
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}

/** The dark band that opens every inner page. */
export function PageHero({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  children?: ReactNode;
}) {
  return (
    <section className="hero-light relative overflow-hidden text-paper">
      <ArchLines className="pointer-events-none absolute -bottom-px right-[4%] hidden h-[118%] w-auto text-brass-300/25 md:block" />
      <div className="relative mx-auto max-w-7xl px-5 pb-16 pt-12 sm:px-8 lg:pb-24 lg:pt-20">
        <p className="eyebrow rise text-brass-300">{eyebrow}</p>
        <h1 className="rise rise-1 mt-4 max-w-4xl text-[clamp(2.4rem,6.2vw,4.5rem)] leading-[1.05]">{title}</h1>
        {lead ? (
          <p className="rise rise-2 mt-6 max-w-2xl font-serif text-[1.35rem] leading-snug text-paper/85 sm:text-2xl">
            {lead}
          </p>
        ) : null}
        {children}
      </div>
    </section>
  );
}

export function Scripture({
  children,
  cite,
  onDark = false,
  className = "",
}: {
  children: ReactNode;
  cite: string;
  onDark?: boolean;
  className?: string;
}) {
  return (
    <figure className={className}>
      <blockquote className="font-serif text-[1.45rem] italic leading-snug sm:text-[1.7rem]">{children}</blockquote>
      <figcaption className={`eyebrow mt-4 ${onDark ? "text-brass-300" : "text-brass-700"}`}>{cite}</figcaption>
    </figure>
  );
}

/** Renders text typed into an admin textarea as paragraphs. */
export function Prose({ text, className = "" }: { text: string; className?: string }) {
  return (
    <div className={`prose-body ${className}`}>
      {paragraphs(text).map((paragraph, index) => (
        <p key={index}>{paragraph}</p>
      ))}
    </div>
  );
}
