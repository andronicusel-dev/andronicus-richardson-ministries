-- Andronicus Richardson Ministries — one-time database setup
--
-- Run this ONCE in your new hosted database (for example, the PSQL console
-- inside Neon). It creates every table the website needs. Safe to run twice:
-- existing tables are left exactly as they are.

create table if not exists site_settings (
  id integer primary key,
  tagline text not null default '',
  welcome_heading text not null default '',
  welcome_body text not null default '',
  about_body text not null default '',
  leader_name text not null default '',
  leader_title text not null default '',
  leader_bio text not null default '',
  address text not null default '',
  city_state_zip text not null default '',
  phone text not null default '',
  phone2 text not null default '',
  email text not null default '',
  giving_url text not null default '',
  giving_note text not null default '',
  facebook_url text not null default '',
  youtube_url text not null default '',
  instagram_url text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists service_times (
  id serial primary key,
  name text not null,
  day text not null,
  time text not null,
  note text not null default '',
  sort_order integer not null default 0,
  is_sample boolean not null default false
);

create table if not exists sermons (
  id serial primary key,
  title text not null,
  speaker text not null default '',
  preached_on date not null,
  scripture text not null default '',
  summary text not null default '',
  video_url text not null default '',
  is_sample boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists events (
  id serial primary key,
  title text not null,
  event_date date not null,
  time_text text not null default '',
  location text not null default '',
  description text not null default '',
  is_sample boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists prayer_requests (
  id serial primary key,
  name text not null default '',
  email text not null default '',
  phone text not null default '',
  request text not null,
  confidential boolean not null default false,
  wants_contact boolean not null default false,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

create table if not exists contact_messages (
  id serial primary key,
  name text not null,
  email text not null default '',
  phone text not null default '',
  topic text not null default '',
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists admins (
  id serial primary key,
  email text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now()
);

create table if not exists sessions (
  token_hash text primary key,
  admin_id integer not null references admins (id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
