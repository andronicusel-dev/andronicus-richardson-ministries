import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { Mark } from "@/components/ui";
import { getUploadedImages } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Staff sign-in",
  robots: { index: false, follow: false },
};

export default async function AuthLayout({ children }: { children: ReactNode }) {
  const logoVersion = (await getUploadedImages()).get("logo");
  return (
    <main className="hero-light flex min-h-screen flex-col items-center justify-center px-5 py-12">
      <Link href="/" className="mb-8 flex flex-col items-center gap-3 text-center text-paper">
        {logoVersion ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={`/media/logo?v=${logoVersion}`} alt="" className="h-16 w-auto max-w-64 object-contain" />
        ) : (
          <Mark className="h-14 w-11 text-brass-300" />
        )}
        <span className="font-display text-2xl leading-tight">
          Andronicus Richardson
          <span className="mt-1.5 block font-sans text-[0.68rem] font-semibold uppercase tracking-[0.42em] text-brass-300">
            Ministries
          </span>
        </span>
      </Link>
      <div className="w-full max-w-md rounded-md bg-white p-7 shadow-2xl sm:p-9">{children}</div>
      <Link href="/" className="mt-8 py-2 text-[0.95rem] text-night-300 underline underline-offset-4 hover:text-paper">
        Back to the website
      </Link>
    </main>
  );
}
