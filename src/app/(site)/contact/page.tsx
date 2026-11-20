import type { Metadata } from "next";
import { ContactForm } from "@/components/public-forms";
import { PageHero, Scripture } from "@/components/ui";
import { getServiceTimes, getSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Visit & contact",
  description: "Service times, directions and a way to reach Andronicus Richardson Ministries.",
};

export default async function ContactPage() {
  const [settings, services] = await Promise.all([getSettings(), getServiceTimes()]);
  const place = [settings.address, settings.cityStateZip].filter(Boolean).join(", ");
  const mapUrl = place ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place)}` : "";
  const link = "font-semibold text-night-700 underline underline-offset-4 hover:text-night-600";

  return (
    <>
      <PageHero
        eyebrow="Visit & contact"
        title="Come and See Us"
        lead="Find out when we gather, or send a message and someone from the ministry will get back to you."
      />

      <section className="mx-auto grid max-w-7xl gap-16 px-5 py-16 sm:px-8 lg:grid-cols-12 lg:py-24">
        <div className="lg:col-span-5">
          <h2 className="text-3xl sm:text-4xl">When we gather</h2>
          {services.length > 0 ? (
            <ul className="mt-6 border-t border-rule">
              {services.map((service) => (
                <li key={service.id} className="border-b border-rule py-4">
                  <p className="font-display text-xl">{service.name}</p>
                  <p className="mt-1 font-semibold tracking-wide text-night-700">
                    {service.day} · {service.time}
                  </p>
                  {service.note ? <p className="mt-1 text-[0.95rem] text-ink-soft">{service.note}</p> : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-lg text-ink-soft">
              Our service times will be posted here. Send us a message and we will let you know when we meet.
            </p>
          )}

          {place ? (
            <>
              <h2 className="mt-12 text-3xl sm:text-4xl">Where to find us</h2>
              <address className="mt-4 text-lg not-italic text-ink-soft">
                {settings.address ? <span className="block">{settings.address}</span> : null}
                {settings.cityStateZip ? <span className="block">{settings.cityStateZip}</span> : null}
              </address>
              <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="link-rule mt-2 text-night-700">
                Get directions <span aria-hidden="true">↗</span>
              </a>
            </>
          ) : null}

          {settings.phone || settings.email ? (
            <>
              <h2 className="mt-12 text-3xl sm:text-4xl">Call or write</h2>
              <ul className="mt-4 space-y-2 text-lg">
                {[settings.phone, settings.phone2].filter(Boolean).map((number) => (
                  <li key={number}>
                    <a href={`tel:${number.replace(/[^\d+]/g, "")}`} className={link}>
                      {number}
                    </a>
                  </li>
                ))}
                {settings.email ? (
                  <li>
                    <a href={`mailto:${settings.email}`} className={`${link} break-all`}>
                      {settings.email}
                    </a>
                  </li>
                ) : null}
              </ul>
            </>
          ) : null}

          <Scripture cite="Matthew 11:28" className="mt-14 border-l border-brass-500 pl-6">
            Come unto me, all ye that labour and are heavy laden, and I will give you rest.
          </Scripture>
        </div>

        <div className="lg:col-span-7 lg:pl-8">
          <h2 className="text-3xl sm:text-4xl">Send us a message</h2>
          <p className="mb-8 mt-3 text-lg text-ink-soft">
            Planning your first visit, or have a question? Write to us here.
          </p>
          <ContactForm />
        </div>
      </section>
    </>
  );
}
