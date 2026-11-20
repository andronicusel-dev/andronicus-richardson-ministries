import { boolean, date, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

/** Single-row table (id = 1) holding everything the ministry can edit about the site. */
export const siteSettings = pgTable("site_settings", {
  id: integer("id").primaryKey(),
  tagline: text("tagline").notNull().default(""),
  welcomeHeading: text("welcome_heading").notNull().default(""),
  welcomeBody: text("welcome_body").notNull().default(""),
  aboutBody: text("about_body").notNull().default(""),
  leaderName: text("leader_name").notNull().default(""),
  leaderTitle: text("leader_title").notNull().default(""),
  leaderBio: text("leader_bio").notNull().default(""),
  address: text("address").notNull().default(""),
  cityStateZip: text("city_state_zip").notNull().default(""),
  phone: text("phone").notNull().default(""),
  phone2: text("phone2").notNull().default(""),
  email: text("email").notNull().default(""),
  givingUrl: text("giving_url").notNull().default(""),
  givingNote: text("giving_note").notNull().default(""),
  facebookUrl: text("facebook_url").notNull().default(""),
  youtubeUrl: text("youtube_url").notNull().default(""),
  instagramUrl: text("instagram_url").notNull().default(""),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const serviceTimes = pgTable("service_times", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  day: text("day").notNull(),
  time: text("time").notNull(),
  note: text("note").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
  isSample: boolean("is_sample").notNull().default(false),
});

export const sermons = pgTable("sermons", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  speaker: text("speaker").notNull().default(""),
  preachedOn: date("preached_on", { mode: "string" }).notNull(),
  scripture: text("scripture").notNull().default(""),
  summary: text("summary").notNull().default(""),
  videoUrl: text("video_url").notNull().default(""),
  isSample: boolean("is_sample").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  eventDate: date("event_date", { mode: "string" }).notNull(),
  timeText: text("time_text").notNull().default(""),
  location: text("location").notNull().default(""),
  description: text("description").notNull().default(""),
  isSample: boolean("is_sample").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const prayerRequests = pgTable("prayer_requests", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().default(""),
  email: text("email").notNull().default(""),
  phone: text("phone").notNull().default(""),
  request: text("request").notNull(),
  confidential: boolean("confidential").notNull().default(false),
  wantsContact: boolean("wants_contact").notNull().default(false),
  status: text("status").notNull().default("new"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().default(""),
  phone: text("phone").notNull().default(""),
  topic: text("topic").notNull().default(""),
  message: text("message").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const admins = pgTable("admins", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Uploaded public-site photographs and logo, stored in Postgres so they survive redeployments. */
export const siteImages = pgTable("site_images", {
  slot: text("slot").primaryKey(),
  contentType: text("content_type").notNull(),
  dataBase64: text("data_base64").notNull(),
  altText: text("alt_text").notNull().default(""),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const sessions = pgTable("sessions", {
  tokenHash: text("token_hash").primaryKey(),
  adminId: integer("admin_id")
    .notNull()
    .references(() => admins.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
