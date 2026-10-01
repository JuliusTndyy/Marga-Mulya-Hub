-- =============================================================================
-- Marga Mulya Hub — 0001_schema.sql
-- Tables, constraints, triggers, functions and indexes (design D8).
--
-- RUN ONCE on a fresh Supabase project (SQL editor). Plain `create table` is used,
-- so this file is NOT re-runnable. Later schema changes go in a new numbered migration.
-- Then run 0002_rls.sql and 0003_storage.sql (both re-runnable).
-- Uses no extensions: gen_random_uuid() is core in PostgreSQL >= 13.
-- =============================================================================

-- shared trigger
create or replace function public.set_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end; $$;

-- -----------------------------------------------------------------------------
-- admin_users + is_admin()
-- -----------------------------------------------------------------------------
create table public.admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'admin' check (role in ('admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.admin_users where id = (select auth.uid()));
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- -----------------------------------------------------------------------------
-- content tables
-- -----------------------------------------------------------------------------
create table public.site_settings (
  id smallint primary key default 1 check (id = 1),
  village_name text not null check (char_length(village_name) between 2 and 120),
  tagline text check (char_length(tagline) <= 200),
  short_description text check (char_length(short_description) <= 600),
  hero_title text check (char_length(hero_title) <= 120),
  hero_description text check (char_length(hero_description) <= 400),
  hero_image_url text,
  address text check (char_length(address) <= 300),
  phone text check (char_length(phone) <= 30),
  whatsapp text check (whatsapp ~ '^62[0-9]{8,13}$'),
  email text check (char_length(email) <= 254),
  service_hours text check (char_length(service_hours) <= 300),
  latitude double precision check (latitude between -90 and 90),
  longitude double precision check (longitude between -180 and 180),
  social_links jsonb not null default '[]'::jsonb check (jsonb_typeof(social_links) = 'array'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((latitude is null) = (longitude is null))
);

create table public.village_profiles (
  id uuid primary key default gen_random_uuid(),
  village_name text not null check (char_length(village_name) between 2 and 120),
  -- plain-text long fields; mirror Zod optionalText(20000)
  description text check (char_length(description) <= 20000),
  history     text check (char_length(history)     <= 20000),
  vision      text check (char_length(vision)      <= 20000),
  mission     text check (char_length(mission)     <= 20000),
  geography   text check (char_length(geography)   <= 20000),
  facilities  text check (char_length(facilities)  <= 20000),
  hero_image_url text,
  status text not null default 'draft' check (status in ('draft','published')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.officials (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  position text not null check (char_length(position) between 2 and 120),
  photo_url text,
  display_order integer not null default 0,
  status text not null default 'draft' check (status in ('draft','published')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.village_statistics (
  id uuid primary key default gen_random_uuid(),
  category text not null check (char_length(category) between 2 and 80),
  indicator text not null check (char_length(indicator) between 1 and 120),
  value numeric(14,2) not null,
  unit text check (char_length(unit) <= 30),
  year integer not null check (year between 1900 and 2100),
  chart_type text not null default 'bar' check (chart_type in ('bar','line','pie','donut','none')),
  display_order integer not null default 0,
  is_published boolean not null default false,
  source text check (char_length(source) <= 300),
  is_sample boolean not null default false,    -- marks placeholder/sample values (EcoQuestData missing)
  is_highlight boolean not null default false, -- stat card on Beranda and top of /data-desa
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (category, indicator, year)
);

create table public.information_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 3 and 200),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 100),
  excerpt text check (char_length(excerpt) <= 400),
  content text check (char_length(content) <= 60000),  -- sanitized HTML subset; Zod caps input at 50 000
  type text not null check (type in ('news','announcement','event','service')),
  cover_image_url text,
  event_date date, event_time time,
  location text check (char_length(location) <= 200),
  organizer text check (char_length(organizer) <= 150),
  priority smallint not null default 0 check (priority between 0 and 2),
  start_date date, end_date date,
  -- null-free window bounds so "active" is two plain filters (no chained .or()):
  effective_start date generated always as (coalesce(start_date, date '-infinity')) stored,
  effective_end   date generated always as (coalesce(end_date,   date 'infinity'))  stored,
  status text not null default 'draft' check (status in ('draft','published')),
  published_at timestamptz,
  sort_date date,                                 -- maintained by trigger; date filter/sort
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  check (end_date is null or start_date is null or end_date >= start_date),
  check (type <> 'event' or event_date is not null)
);

create table public.potentials (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 150),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 100),
  category text not null check (char_length(category) between 2 and 60),
  summary text check (char_length(summary) <= 300),
  description text check (char_length(description) <= 60000),  -- sanitized HTML subset; Zod caps input at 50 000
  image_url text,
  owner_or_manager text check (char_length(owner_or_manager) <= 150),
  address text check (char_length(address) <= 300),
  latitude double precision check (latitude between -90 and 90),
  longitude double precision check (longitude between -180 and 180),
  contact text check (char_length(contact) <= 100),
  whatsapp text check (whatsapp ~ '^62[0-9]{8,13}$'),
  operating_hours text check (char_length(operating_hours) <= 200),
  social_links jsonb not null default '[]'::jsonb check (jsonb_typeof(social_links) = 'array'),
  is_featured boolean not null default false,
  status text not null default 'draft' check (status in ('draft','published')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  check ((latitude is null) = (longitude is null))
);

create table public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 2 and 150),
  description text check (char_length(description) <= 1000),
  image_url text not null,
  alt_text text not null check (char_length(alt_text) between 5 and 200),
  category text not null check (char_length(category) between 2 and 60),
  event_date date,
  location text check (char_length(location) <= 200),
  status text not null default 'draft' check (status in ('draft','published')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 100),
  contact text not null check (char_length(contact) between 5 and 100),
  subject text not null check (char_length(subject) between 3 and 150),
  message text not null check (char_length(message) between 10 and 2000),
  status text not null default 'unread' check (status in ('unread','read','archived')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.citizen_submissions (
  id uuid primary key default gen_random_uuid(),
  submitter_name text not null check (char_length(submitter_name) between 2 and 100),
  contact text check (char_length(contact) <= 100),
  category text not null check (category in ('Potensi Lokal','Kegiatan Masyarakat','Infrastruktur','Lingkungan','Informasi Lainnya')),
  title text not null check (char_length(title) between 5 and 150),
  description text not null check (char_length(description) between 20 and 3000),
  image_url text check (image_url is null or image_url ~ '^pending/[0-9a-f-]{36}\.(jpg|png|webp)$'), -- object path in private bucket
  location text check (char_length(location) <= 200),
  latitude double precision check (latitude between -90 and 90),
  longitude double precision check (longitude between -180 and 180),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  admin_notes text check (char_length(admin_notes) <= 1000),
  reviewed_at timestamptz,
  converted_type text check (converted_type in ('potential','news')),
  converted_id uuid,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  check ((latitude is null) = (longitude is null)),
  check (converted_id is null or status = 'approved'),
  check ((converted_id is null) = (converted_type is null))
);

-- -----------------------------------------------------------------------------
-- updated_at triggers (one per table)
-- -----------------------------------------------------------------------------
create trigger admin_users_set_updated_at before update on public.admin_users
  for each row execute function public.set_updated_at();
create trigger site_settings_set_updated_at before update on public.site_settings
  for each row execute function public.set_updated_at();
create trigger village_profiles_set_updated_at before update on public.village_profiles
  for each row execute function public.set_updated_at();
create trigger officials_set_updated_at before update on public.officials
  for each row execute function public.set_updated_at();
create trigger village_statistics_set_updated_at before update on public.village_statistics
  for each row execute function public.set_updated_at();
create trigger information_posts_set_updated_at before update on public.information_posts
  for each row execute function public.set_updated_at();
create trigger potentials_set_updated_at before update on public.potentials
  for each row execute function public.set_updated_at();
create trigger gallery_items_set_updated_at before update on public.gallery_items
  for each row execute function public.set_updated_at();
create trigger contact_messages_set_updated_at before update on public.contact_messages
  for each row execute function public.set_updated_at();
create trigger citizen_submissions_set_updated_at before update on public.citizen_submissions
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- information_posts: DB-owned published_at and sort_date
-- -----------------------------------------------------------------------------
create or replace function public.information_posts_derive() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.status = 'published' and new.published_at is null then new.published_at = now(); end if;
  -- keep 'Asia/Jakarta' in sync with SITE_TIMEZONE in src/lib/config.ts
  new.sort_date = coalesce(new.event_date, new.start_date,
                           (coalesce(new.published_at, new.created_at, now()) at time zone 'Asia/Jakarta')::date);
  return new;
end; $$;

create trigger information_posts_derive before insert or update on public.information_posts
  for each row execute function public.information_posts_derive();

-- -----------------------------------------------------------------------------
-- indexes
-- -----------------------------------------------------------------------------
create index on public.information_posts (status, type, sort_date desc);
create index on public.information_posts (type, effective_start, effective_end) where status = 'published';
create index on public.potentials (status, category);
create index on public.potentials (status, is_featured);
create index on public.village_statistics (is_published, category, year);
create index on public.officials (status, display_order);
create index on public.gallery_items (status, category, event_date desc);
create index on public.contact_messages (status, created_at desc);
create index on public.citizen_submissions (status, created_at desc);
