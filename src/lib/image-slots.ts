/** The places on the public website where a ministry can supply its own image. */
export const IMAGE_SLOTS = {
  logo: {
    label: "Ministry logo",
    location: "Shown in the website header and footer, beside the ministry name.",
    tip: "A square PNG with a transparent background works especially well.",
    defaultSrc: null,
    defaultAlt: "",
  },
  hero: {
    label: "Main home page picture",
    location: "The large arched picture at the top of the home page and on the prayer page.",
    tip: "A tall or portrait photo works best.",
    defaultSrc: "/images/hero-green.jpg",
    defaultAlt: "Morning light streaming through the windows of a quiet sanctuary",
  },
  welcome: {
    label: "Welcome picture",
    location: "The arched picture beside the welcome message on the home page.",
    tip: "A tall or portrait photo works best.",
    defaultSrc: "/images/doors-green.jpg",
    defaultAlt: "Church doors standing open to warm morning sunlight",
  },
  sermon: {
    label: "Sermons picture",
    location: "The picture beside the latest sermon on the home page.",
    tip: "A wide or landscape photo works best.",
    defaultSrc: "/images/bible-green.jpg",
    defaultAlt: "An open Bible resting on a wooden pulpit",
  },
  about: {
    label: "About page picture",
    location: "The picture beside the story on the About page.",
    tip: "A portrait photo works well, though any shape can be used.",
    defaultSrc: "/images/pews-green.jpg",
    defaultAlt: "Hymnals tucked into a wooden pew",
  },
} as const;

export type ImageSlot = keyof typeof IMAGE_SLOTS;
export const IMAGE_SLOT_ORDER: ImageSlot[] = ["logo", "hero", "welcome", "sermon", "about"];

export function isImageSlot(value: string): value is ImageSlot {
  return Object.prototype.hasOwnProperty.call(IMAGE_SLOTS, value);
}

export type SiteImage = { src: string | null; alt: string; custom: boolean };
export type SiteImageManifest = Record<ImageSlot, SiteImage>;

export function defaultImageManifest(): SiteImageManifest {
  return Object.fromEntries(
    IMAGE_SLOT_ORDER.map((slot) => [
      slot,
      { src: IMAGE_SLOTS[slot].defaultSrc, alt: IMAGE_SLOTS[slot].defaultAlt, custom: false },
    ]),
  ) as SiteImageManifest;
}
