// Pure helpers that are safe to import from both server and client components.

export const CHURCH_NAME = "Andronicus Richardson Ministries";

/** Parses a calendar date ("YYYY-MM-DD") as a UTC date so it never shifts by timezone. */
export function parseISODate(iso: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  return Number.isNaN(date.getTime()) ? null : date;
}

export function toISO(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function todayISO(): string {
  return toISO(new Date());
}

export function shiftISO(iso: string, days: number): string {
  const date = parseISODate(iso) ?? new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return toISO(date);
}

export function formatLongDate(iso: string): string {
  const date = parseISODate(iso);
  if (!date) return iso;
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function formatMediumDate(iso: string): string {
  const date = parseISODate(iso);
  if (!date) return iso;
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function dateParts(iso: string): { month: string; day: string; weekday: string } {
  const date = parseISODate(iso);
  if (!date) return { month: "", day: "", weekday: "" };
  return {
    month: date.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" }),
    day: String(date.getUTCDate()),
    weekday: date.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" }),
  };
}

/** Splits free text typed into a textarea into paragraphs. */
export function paragraphs(text: string): string[] {
  return text
    .split(/\n\s*\n|\r\n\s*\r\n/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

/** Turns a YouTube or Facebook video link into an embeddable player URL, when possible. */
export function videoEmbed(url: string): { provider: "YouTube" | "Facebook"; src: string } | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  const host = parsed.hostname.replace(/^www\.|^m\./, "");

  if (host === "youtu.be") {
    const id = parsed.pathname.split("/")[1];
    return id ? { provider: "YouTube", src: `https://www.youtube-nocookie.com/embed/${id}` } : null;
  }
  if (host === "youtube.com" || host === "youtube-nocookie.com") {
    const segments = parsed.pathname.split("/").filter(Boolean);
    let id = parsed.searchParams.get("v") ?? "";
    if (!id && ["live", "shorts", "embed"].includes(segments[0] ?? "")) id = segments[1] ?? "";
    return /^[\w-]{6,}$/.test(id)
      ? { provider: "YouTube", src: `https://www.youtube-nocookie.com/embed/${id}` }
      : null;
  }
  if (host === "facebook.com" || host === "fb.watch") {
    return {
      provider: "Facebook",
      src: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false`,
    };
  }
  return null;
}
