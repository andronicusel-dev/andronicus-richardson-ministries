import type { Metadata } from "next";
import { PrayerForm } from "@/components/public-forms";
import { ArchImage, PageHero, Scripture } from "@/components/ui";
import { getUploadedImages, uploadedSrc } from "@/lib/data";

export const metadata: Metadata = {
  title: "Prayer requests",
  description: "Send a prayer request to Andronicus Richardson Ministries.",
};

export default async function PrayerPage() {
  const uploads = await getUploadedImages();
  return (
    <>
      <PageHero
        eyebrow="Prayer"
        title="How can we pray for you?"
        lead="You do not have to carry it alone. Send your request and our ministry team will pray over it."
      />

      <section className="mx-auto grid max-w-7xl gap-16 px-5 py-16 sm:px-8 lg:grid-cols-12 lg:py-24">
        <div className="lg:col-span-7">
          <PrayerForm />
        </div>
        <aside className="lg:col-span-5 lg:pl-8">
          <ArchImage
            src="/images/hero-green.jpg"
            alt="Shafts of morning light falling across an empty sanctuary"
            sizes="(min-width: 1024px) 24vw, 16rem"
            className="mx-auto mt-6 w-full max-w-[15rem] lg:mx-0 lg:ml-6 lg:max-w-[19rem]"
          />
          <Scripture cite="Philippians 4:6" className="mt-10 border-l border-brass-500 pl-6">
            Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be
            made known unto God.
          </Scripture>
        </aside>
      </section>
    </>
  );
}
