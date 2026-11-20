import type { Metadata } from "next";
import { NotFoundContent } from "@/components/not-found-content";
import { SiteHeader } from "@/components/site-chrome";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-night-900">
      <SiteHeader />
      <main className="flex flex-1 flex-col [&>section]:flex-1">
        <NotFoundContent />
      </main>
    </div>
  );
}
