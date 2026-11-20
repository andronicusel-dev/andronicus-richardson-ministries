import { cache } from "react";
import { and, asc, count, desc, eq, gte } from "drizzle-orm";
import { db } from "@/db";
import {
  contactMessages,
  events,
  prayerRequests,
  sermons,
  serviceTimes,
  siteSettings,
} from "@/db/schema";
import { parseISODate, shiftISO, todayISO } from "@/lib/format";

export type Settings = typeof siteSettings.$inferSelect;
export type ServiceTime = typeof serviceTimes.$inferSelect;
export type Sermon = typeof sermons.$inferSelect;
export type ChurchEvent = typeof events.$inferSelect;
export type PrayerRequest = typeof prayerRequests.$inferSelect;
export type ContactMessage = typeof contactMessages.$inferSelect;

/** Starter wording shown until the ministry rewrites it under Admin → Site details. */
export const DEFAULT_COPY = {
  email: "andronicusel@gmail.com",
  phone: "0556740441",
  phone2: "0532966080",
  tagline: "Come as you are. Worship with us, hear the Word, and let us pray with you.",
  welcomeHeading: "There is a seat here for you.",
  welcomeBody:
    "Whether you have been in church all your life or you are walking through the doors for the first time, you are welcome at Andronicus Richardson Ministries.\n\nWe gather to worship God, to study the Bible together, and to pray for one another. We would be glad to have you with us.",
  aboutBody:
    "Andronicus Richardson Ministries exists to lift up the name of Jesus Christ, to teach the Bible plainly, and to care for people, in our services and all through the week.\n\nWe believe church should feel like family. When you visit you will be greeted, you will hear the Word, and if you would like it, someone will pray with you. Nobody is asked to have it all together before they come.\n\nIf you are looking for a church home, or you simply have questions about faith, we would love to meet you.",
};

function weekdayOnOrAfter(fromISO: string, weekday: number, minDaysAhead: number): string {
  let iso = shiftISO(fromISO, minDaysAhead);
  while ((parseISODate(iso)?.getUTCDay() ?? weekday) !== weekday) iso = shiftISO(iso, 1);
  return iso;
}

function sundayBefore(fromISO: string, weeksBack: number): string {
  const dow = parseISODate(fromISO)?.getUTCDay() ?? 0;
  return shiftISO(fromISO, -((dow === 0 ? 7 : dow) + weeksBack * 7));
}

/**
 * First-run setup. Creates the settings row and a small set of starter content (flagged
 * `isSample`) so the site reads as complete before the ministry adds its own details.
 */
async function seed(): Promise<Settings> {
  return db.transaction(async (tx) => {
    const inserted = await tx
      .insert(siteSettings)
      .values({ id: 1, ...DEFAULT_COPY })
      .onConflictDoNothing()
      .returning();

    if (!inserted[0]) {
      const [existing] = await tx.select().from(siteSettings).where(eq(siteSettings.id, 1));
      return existing;
    }

    const today = todayISO();

    await tx.insert(serviceTimes).values([
      { name: "Sunday Morning Worship", day: "Sundays", time: "10:00 AM", sortOrder: 1, isSample: true },
      { name: "Midweek Bible Study", day: "Wednesdays", time: "7:00 PM", sortOrder: 2, isSample: true },
      { name: "Prayer Meeting", day: "Fridays", time: "6:30 PM", sortOrder: 3, isSample: true },
    ]);

    await tx.insert(sermons).values([
      {
        title: "Joy Cometh in the Morning",
        preachedOn: sundayBefore(today, 0),
        scripture: "Psalm 30:5",
        summary:
          "“Weeping may endure for a night, but joy cometh in the morning.” The night is real, and Scripture does not pretend otherwise. But the night does not get the last word.\n\nA message for anyone who is still waiting on morning: how to hold on to God in the dark hours, and what it looks like when He turns mourning into dancing.",
        isSample: true,
      },
      {
        title: "The Substance of Things Hoped For",
        preachedOn: sundayBefore(today, 1),
        scripture: "Hebrews 11:1",
        summary:
          "“Now faith is the substance of things hoped for, the evidence of things not seen.” Faith is not wishing. It is standing on what God has said before you can see it.\n\nWe walk through Hebrews 11 and the men and women who believed God when they had nothing else to go on.",
        isSample: true,
      },
      {
        title: "They That Wait Upon the Lord",
        preachedOn: sundayBefore(today, 2),
        scripture: "Isaiah 40:31",
        summary:
          "“But they that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint.”\n\nWaiting is not wasted time. A word of encouragement for the weary, and a reminder of where strength comes from.",
        isSample: true,
      },
    ]);

    await tx.insert(events).values([
      {
        title: "Friends & Family Sunday",
        eventDate: weekdayOnOrAfter(today, 0, 8),
        timeText: "10:00 AM",
        description:
          "Bring someone you love. A special service of worship and the Word, with time to meet one another afterward.",
        isSample: true,
      },
      {
        title: "Community Prayer Night",
        eventDate: weekdayOnOrAfter(today, 5, 12),
        timeText: "7:00 PM",
        description:
          "An evening set aside to pray for our families, our city, and every request sent in to the ministry. Come for all of it or part of it.",
        isSample: true,
      },
      {
        title: "Night of Worship",
        eventDate: weekdayOnOrAfter(today, 6, 22),
        timeText: "6:00 PM",
        description: "Songs, testimony and thanksgiving. Everyone is welcome.",
        isSample: true,
      },
    ]);

    return inserted[0];
  });
}

export const getSettings = cache(async (): Promise<Settings> => {
  const [row] = await db.select().from(siteSettings).where(eq(siteSettings.id, 1)).limit(1);
  return row ?? seed();
});

export const getServiceTimes = cache(async (): Promise<ServiceTime[]> => {
  await getSettings();
  return db.select().from(serviceTimes).orderBy(asc(serviceTimes.sortOrder), asc(serviceTimes.id));
});

export async function getSermons(limit?: number): Promise<Sermon[]> {
  await getSettings();
  const query = db.select().from(sermons).orderBy(desc(sermons.preachedOn), desc(sermons.id));
  return limit ? query.limit(limit) : query;
}

export async function getSermon(id: number): Promise<Sermon | null> {
  await getSettings();
  const [row] = await db.select().from(sermons).where(eq(sermons.id, id)).limit(1);
  return row ?? null;
}

/**
 * Events are stored as plain calendar dates. The server clock runs on UTC, so an event
 * stays listed for one extra day rather than vanishing early for evening visitors.
 */
function upcomingCutoff(): string {
  return shiftISO(todayISO(), -1);
}

export async function getUpcomingEvents(limit?: number): Promise<ChurchEvent[]> {
  await getSettings();
  const query = db
    .select()
    .from(events)
    .where(gte(events.eventDate, upcomingCutoff()))
    .orderBy(asc(events.eventDate), asc(events.id));
  return limit ? query.limit(limit) : query;
}

export async function getAllEvents(): Promise<ChurchEvent[]> {
  await getSettings();
  return db.select().from(events).orderBy(desc(events.eventDate), desc(events.id));
}

export function isUpcoming(event: ChurchEvent): boolean {
  return event.eventDate >= upcomingCutoff();
}

export const getInboxCounts = cache(async () => {
  const [[prayers], [messages]] = await Promise.all([
    db.select({ n: count() }).from(prayerRequests).where(eq(prayerRequests.status, "new")),
    db.select({ n: count() }).from(contactMessages).where(eq(contactMessages.isRead, false)),
  ]);
  return { newPrayers: prayers?.n ?? 0, unreadMessages: messages?.n ?? 0 };
});

export async function getAdminOverview() {
  await getSettings();
  const cutoff = upcomingCutoff();
  const [[sermonTotal], [sermonOwn], [eventUpcoming], [eventOwn], [sampleServices], [sampleSermons], [sampleEvents]] =
    await Promise.all([
      db.select({ n: count() }).from(sermons),
      db.select({ n: count() }).from(sermons).where(eq(sermons.isSample, false)),
      db.select({ n: count() }).from(events).where(gte(events.eventDate, cutoff)),
      db
        .select({ n: count() })
        .from(events)
        .where(and(gte(events.eventDate, cutoff), eq(events.isSample, false))),
      db.select({ n: count() }).from(serviceTimes).where(eq(serviceTimes.isSample, true)),
      db.select({ n: count() }).from(sermons).where(eq(sermons.isSample, true)),
      db.select({ n: count() }).from(events).where(eq(events.isSample, true)),
    ]);
  return {
    sermons: sermonTotal?.n ?? 0,
    ownSermons: sermonOwn?.n ?? 0,
    upcomingEvents: eventUpcoming?.n ?? 0,
    ownUpcomingEvents: eventOwn?.n ?? 0,
    sampleServices: sampleServices?.n ?? 0,
    sampleSermons: sampleSermons?.n ?? 0,
    sampleEvents: sampleEvents?.n ?? 0,
  };
}

export async function getPrayerRequests(): Promise<PrayerRequest[]> {
  return db.select().from(prayerRequests).orderBy(desc(prayerRequests.createdAt));
}

export async function getContactMessages(): Promise<ContactMessage[]> {
  return db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));
}
