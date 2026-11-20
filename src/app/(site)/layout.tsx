import type { ReactNode } from "react";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { getServiceTimes, getSettings } from "@/lib/data";
import { getSiteImages } from "@/lib/site-images";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const [settings, services, images] = await Promise.all([getSettings(), getServiceTimes(), getSiteImages()]);
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <SiteHeader logoSrc={images.logo.src} />
      <main id="main">{children}</main>
      <SiteFooter settings={settings} services={services} logoSrc={images.logo.src} />
    </>
  );
}
