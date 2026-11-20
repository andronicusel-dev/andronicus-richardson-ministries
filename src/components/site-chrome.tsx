import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { Mark } from "@/components/ui";
import type { ServiceTime, Settings } from "@/lib/data";
import { CHURCH_NAME } from "@/lib/format";

export function SiteHeader() {
  return (
    <header className="relative z-40 bg-night-950 text-paper">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3 sm:px-8 lg:py-4">
        <Link href="/" aria-label={`${CHURCH_NAME}, home`} className="flex min-w-0 items-center gap-3 py-1">
          <Mark className="h-10 w-8 shrink-0 text-brass-300" />
          <span className="min-w-0 leading-none">
            <span className="block truncate font-display text-base tracking-wide sm:text-xl">
              Andronicus Richardson
            </span>
            <span className="mt-1.5 block text-[0.62rem] font-semibold uppercase tracking-[0.42em] text-brass-300">
              Ministries
            </span>
          </span>
        </Link>
        <SiteNav />
      </div>
    </header>
  );
}

const EXPLORE = [
  { href: "/about", label: "About the ministry" },
  { href: "/sermons", label: "Sermons" },
  { href: "/events", label: "Events" },
  { href: "/prayer", label: "Prayer requests" },
  { href: "/give", label: "Give" },
];

export function SiteFooter({ settings, services }: { settings: Settings; services: ServiceTime[] }) {
  const socials = [
    { label: "Facebook", url: settings.facebookUrl },
    { label: "YouTube", url: settings.youtubeUrl },
    { label: "Instagram", url: settings.instagramUrl },
  ].filter((social) => social.url);
  const linkClass = "inline-block py-1.5 text-paper/80 transition-colors hover:text-brass-200";

  return (
    <footer className="bg-night-950 text-night-300">
      <div className="mx-auto max-w-7xl px-5 pb-10 pt-16 sm:px-8 lg:pt-20">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          <div className="sm:col-span-2 lg:col-span-4">
            <div className="flex items-center gap-4 text-paper">
              <Mark className="h-14 w-11 shrink-0 text-brass-300" />
              <p className="font-display text-2xl leading-tight sm:text-[1.7rem]">
                Andronicus Richardson
                <span className="mt-1.5 block font-sans text-[0.68rem] font-semibold uppercase tracking-[0.42em] text-brass-300">
                  Ministries
                </span>
              </p>
            </div>
            <p className="mt-6 max-w-sm font-serif text-xl italic leading-snug text-paper/75">{settings.tagline}</p>
          </div>

          <div className="lg:col-span-3">
            <h2 className="eyebrow text-brass-300">When we gather</h2>
            {services.length > 0 ? (
              <ul className="mt-4 space-y-3">
                {services.map((service) => (
                  <li key={service.id}>
                    <span className="block text-paper">{service.name}</span>
                    <span className="block text-[0.95rem]">
                      {service.day} · {service.time}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4">Service times will be posted soon.</p>
            )}
          </div>

          <div className="lg:col-span-2">
            <h2 className="eyebrow text-brass-300">Explore</h2>
            <ul className="mt-3">
              {EXPLORE.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h2 className="eyebrow text-brass-300">Reach us</h2>
            <ul className="mt-3">
              {settings.address || settings.cityStateZip ? (
                <li className="py-1.5 text-paper/80">
                  {settings.address ? <span className="block">{settings.address}</span> : null}
                  {settings.cityStateZip ? <span className="block">{settings.cityStateZip}</span> : null}
                </li>
              ) : null}
              {[settings.phone, settings.phone2].filter(Boolean).map((number) => (
                <li key={number}>
                  <a href={`tel:${number.replace(/[^\d+]/g, "")}`} className={linkClass}>
                    {number}
                  </a>
                </li>
              ))}
              {settings.email ? (
                <li>
                  <a href={`mailto:${settings.email}`} className={`${linkClass} break-words`}>
                    {settings.email}
                  </a>
                </li>
              ) : null}
              <li>
                <Link href="/contact" className={linkClass}>
                  Send us a message
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-paper/10 pt-6 text-[0.92rem] sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {CHURCH_NAME}
          </p>
          <ul className="flex flex-wrap items-center gap-x-6">
            {socials.map((social) => (
              <li key={social.label}>
                <a href={social.url} target="_blank" rel="noopener noreferrer" className={linkClass}>
                  {social.label}
                </a>
              </li>
            ))}
            <li>
              <Link href="/admin" className="inline-block py-1.5 transition-colors hover:text-brass-200">
                Staff sign-in
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
