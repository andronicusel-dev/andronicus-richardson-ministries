"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const LINKS = [
  { href: "/about", label: "About" },
  { href: "/sermons", label: "Sermons" },
  { href: "/events", label: "Events" },
  { href: "/prayer", label: "Prayer" },
  { href: "/contact", label: "Visit" },
];

export function SiteNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <nav aria-label="Main" className="hidden items-center gap-8 lg:flex">
        <ul className="flex items-center gap-7">
          {LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={`border-b py-2 text-[0.95rem] tracking-wide transition-colors hover:text-brass-200 ${
                  isActive(link.href) ? "border-brass-300 text-brass-200" : "border-transparent text-paper/80"
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        <Link href="/give" className="btn btn-brass min-h-11 px-6 py-2">
          Give
        </Link>
      </nav>

      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen((value) => !value)}
        className="-mr-2 flex h-12 w-12 shrink-0 items-center justify-center text-paper lg:hidden"
      >
        <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
        <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          {open ? <path d="M5 5l14 14M19 5L5 19" /> : <path d="M3 7h18M3 12h18M3 17h18" />}
        </svg>
      </button>

      {open ? (
        <nav
          id="mobile-menu"
          aria-label="Main"
          className="absolute inset-x-0 top-full border-t border-paper/10 bg-night-950 px-5 pb-8 shadow-2xl sm:px-8 lg:hidden"
        >
          <ul>
            {LINKS.map((link) => (
              <li key={link.href} className="border-b border-paper/10">
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className={`block py-4 font-display text-2xl ${isActive(link.href) ? "text-brass-200" : "text-paper"}`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/give" onClick={() => setOpen(false)} className="btn btn-brass mt-6 w-full">
            Give
          </Link>
        </nav>
      ) : null}
    </>
  );
}
