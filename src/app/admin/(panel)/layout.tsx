import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { logout } from "@/app/actions/admin";
import { AdminNav } from "@/components/admin-client";
import { Mark } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { getInboxCounts, getUploadedImages } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const admin = await requireAdmin();
  const counts = await getInboxCounts();
  const logoVersion = (await getUploadedImages()).get("logo");

  return (
    <div className="min-h-screen bg-[#eef1e6]">
      <header className="bg-night-950 text-paper">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-5 pb-2 pt-4 sm:px-8">
          <Link href="/admin" className="flex items-center gap-3">
            {logoVersion ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={`/media/logo?v=${logoVersion}`} alt="" className="h-10 w-auto max-w-40 shrink-0 object-contain" />
            ) : (
              <Mark className="h-9 w-7 shrink-0 text-brass-300" />
            )}
            <span className="leading-none">
              <span className="block font-display text-lg">Andronicus Richardson</span>
              <span className="mt-1 block text-[0.62rem] font-semibold uppercase tracking-[0.32em] text-brass-300">
                Ministries · Admin
              </span>
            </span>
          </Link>
          <div className="flex flex-wrap items-center gap-2 text-[0.92rem]">
            <span className="mr-2 hidden text-night-300 md:inline">{admin.email}</span>
            <a
              href="/"
              target="_blank"
              rel="noopener"
              className="flex min-h-11 items-center rounded border border-paper/25 px-3 font-semibold hover:border-brass-300 hover:text-brass-200"
            >
              View website <span aria-hidden="true" className="ml-1.5">↗</span>
            </a>
            <form action={logout}>
              <button
                type="submit"
                className="flex min-h-11 items-center rounded px-3 font-semibold text-night-300 hover:text-paper"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
        <AdminNav newPrayers={counts.newPrayers} unreadMessages={counts.unreadMessages} />
      </header>
      <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8">{children}</main>
    </div>
  );
}
