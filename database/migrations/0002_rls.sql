-- =============================================================================
-- Marga Mulya Hub — 0002_rls.sql
-- Grants + Row Level Security policies (design D9). Run after 0001_schema.sql.
--
-- FULLY RE-RUNNABLE: revoke/grant/enable are idempotent and every policy is dropped
-- before it is created. Re-run this whole file after adding new tables, because new
-- tables inherit Supabase's default (broad) privileges.
-- =============================================================================

-- Narrow Supabase's default privileges, then grant back only what is needed.
revoke all on all tables in schema public from anon, authenticated;

grant usage on schema public to anon, authenticated;
grant select on public.site_settings, public.village_profiles, public.officials, public.village_statistics,
  public.information_posts, public.potentials, public.gallery_items to anon;
grant insert on public.contact_messages, public.citizen_submissions to anon;
grant select, insert, update, delete on all tables in schema public to authenticated;  -- RLS restricts to is_admin()

alter table public.admin_users         enable row level security;
alter table public.site_settings       enable row level security;
alter table public.village_profiles    enable row level security;
alter table public.officials           enable row level security;
alter table public.village_statistics  enable row level security;
alter table public.information_posts   enable row level security;
alter table public.potentials          enable row level security;
alter table public.gallery_items       enable row level security;
alter table public.contact_messages    enable row level security;
alter table public.citizen_submissions enable row level security;

-- -----------------------------------------------------------------------------
-- admin_users: an authenticated user sees its own row; admins see all.
-- No insert/update/delete policy: rows are managed from the SQL editor only.
-- -----------------------------------------------------------------------------
drop policy if exists "admin_users select" on public.admin_users;
create policy "admin_users select" on public.admin_users for select to authenticated
  using (id = (select auth.uid()) or public.is_admin());

-- -----------------------------------------------------------------------------
-- site_settings: public read; admin insert/update; no delete (singleton).
-- -----------------------------------------------------------------------------
drop policy if exists "site_settings select" on public.site_settings;
create policy "site_settings select" on public.site_settings for select to anon, authenticated
  using (true);
drop policy if exists "site_settings insert" on public.site_settings;
create policy "site_settings insert" on public.site_settings for insert to anon, authenticated
  with check (public.is_admin());
drop policy if exists "site_settings update" on public.site_settings;
create policy "site_settings update" on public.site_settings for update to anon, authenticated
  using (public.is_admin()) with check (public.is_admin());

-- -----------------------------------------------------------------------------
-- village_profiles
-- -----------------------------------------------------------------------------
drop policy if exists "village_profiles select" on public.village_profiles;
create policy "village_profiles select" on public.village_profiles for select to anon, authenticated
  using (status = 'published' or public.is_admin());
drop policy if exists "village_profiles insert" on public.village_profiles;
create policy "village_profiles insert" on public.village_profiles for insert to anon, authenticated
  with check (public.is_admin());
drop policy if exists "village_profiles update" on public.village_profiles;
create policy "village_profiles update" on public.village_profiles for update to anon, authenticated
  using (public.is_admin()) with check (public.is_admin());
drop policy if exists "village_profiles delete" on public.village_profiles;
create policy "village_profiles delete" on public.village_profiles for delete to anon, authenticated
  using (public.is_admin());

-- -----------------------------------------------------------------------------
-- officials
-- -----------------------------------------------------------------------------
drop policy if exists "officials select" on public.officials;
create policy "officials select" on public.officials for select to anon, authenticated
  using (status = 'published' or public.is_admin());
drop policy if exists "officials insert" on public.officials;
create policy "officials insert" on public.officials for insert to anon, authenticated
  with check (public.is_admin());
drop policy if exists "officials update" on public.officials;
create policy "officials update" on public.officials for update to anon, authenticated
  using (public.is_admin()) with check (public.is_admin());
drop policy if exists "officials delete" on public.officials;
create policy "officials delete" on public.officials for delete to anon, authenticated
  using (public.is_admin());

-- -----------------------------------------------------------------------------
-- village_statistics (is_published instead of status)
-- -----------------------------------------------------------------------------
drop policy if exists "village_statistics select" on public.village_statistics;
create policy "village_statistics select" on public.village_statistics for select to anon, authenticated
  using (is_published or public.is_admin());
drop policy if exists "village_statistics insert" on public.village_statistics;
create policy "village_statistics insert" on public.village_statistics for insert to anon, authenticated
  with check (public.is_admin());
drop policy if exists "village_statistics update" on public.village_statistics;
create policy "village_statistics update" on public.village_statistics for update to anon, authenticated
  using (public.is_admin()) with check (public.is_admin());
drop policy if exists "village_statistics delete" on public.village_statistics;
create policy "village_statistics delete" on public.village_statistics for delete to anon, authenticated
  using (public.is_admin());

-- -----------------------------------------------------------------------------
-- information_posts
-- -----------------------------------------------------------------------------
drop policy if exists "information_posts select" on public.information_posts;
create policy "information_posts select" on public.information_posts for select to anon, authenticated
  using (status = 'published' or public.is_admin());
drop policy if exists "information_posts insert" on public.information_posts;
create policy "information_posts insert" on public.information_posts for insert to anon, authenticated
  with check (public.is_admin());
drop policy if exists "information_posts update" on public.information_posts;
create policy "information_posts update" on public.information_posts for update to anon, authenticated
  using (public.is_admin()) with check (public.is_admin());
drop policy if exists "information_posts delete" on public.information_posts;
create policy "information_posts delete" on public.information_posts for delete to anon, authenticated
  using (public.is_admin());

-- -----------------------------------------------------------------------------
-- potentials
-- -----------------------------------------------------------------------------
drop policy if exists "potentials select" on public.potentials;
create policy "potentials select" on public.potentials for select to anon, authenticated
  using (status = 'published' or public.is_admin());
drop policy if exists "potentials insert" on public.potentials;
create policy "potentials insert" on public.potentials for insert to anon, authenticated
  with check (public.is_admin());
drop policy if exists "potentials update" on public.potentials;
create policy "potentials update" on public.potentials for update to anon, authenticated
  using (public.is_admin()) with check (public.is_admin());
drop policy if exists "potentials delete" on public.potentials;
create policy "potentials delete" on public.potentials for delete to anon, authenticated
  using (public.is_admin());

-- -----------------------------------------------------------------------------
-- gallery_items
-- -----------------------------------------------------------------------------
drop policy if exists "gallery_items select" on public.gallery_items;
create policy "gallery_items select" on public.gallery_items for select to anon, authenticated
  using (status = 'published' or public.is_admin());
drop policy if exists "gallery_items insert" on public.gallery_items;
create policy "gallery_items insert" on public.gallery_items for insert to anon, authenticated
  with check (public.is_admin());
drop policy if exists "gallery_items update" on public.gallery_items;
create policy "gallery_items update" on public.gallery_items for update to anon, authenticated
  using (public.is_admin()) with check (public.is_admin());
drop policy if exists "gallery_items delete" on public.gallery_items;
create policy "gallery_items delete" on public.gallery_items for delete to anon, authenticated
  using (public.is_admin());

-- -----------------------------------------------------------------------------
-- contact_messages: public insert (unread only); admin read/update/delete.
-- Public inserts must not use .select() (no anon select grant/policy).
-- -----------------------------------------------------------------------------
drop policy if exists "contact_messages select" on public.contact_messages;
create policy "contact_messages select" on public.contact_messages for select to authenticated
  using (public.is_admin());
drop policy if exists "contact_messages insert" on public.contact_messages;
create policy "contact_messages insert" on public.contact_messages for insert to anon, authenticated
  with check (status = 'unread');
drop policy if exists "contact_messages update" on public.contact_messages;
create policy "contact_messages update" on public.contact_messages for update to anon, authenticated
  using (public.is_admin()) with check (public.is_admin());
drop policy if exists "contact_messages delete" on public.contact_messages;
create policy "contact_messages delete" on public.contact_messages for delete to anon, authenticated
  using (public.is_admin());

-- -----------------------------------------------------------------------------
-- citizen_submissions: public insert (pending, no admin fields); admin read/update/delete.
-- Submitter contact stays private: anon has neither a select grant nor a select policy.
-- -----------------------------------------------------------------------------
drop policy if exists "citizen_submissions select" on public.citizen_submissions;
create policy "citizen_submissions select" on public.citizen_submissions for select to authenticated
  using (public.is_admin());
drop policy if exists "citizen_submissions insert" on public.citizen_submissions;
create policy "citizen_submissions insert" on public.citizen_submissions for insert to anon, authenticated
  with check (status = 'pending' and admin_notes is null and reviewed_at is null
              and converted_type is null and converted_id is null);
drop policy if exists "citizen_submissions update" on public.citizen_submissions;
create policy "citizen_submissions update" on public.citizen_submissions for update to anon, authenticated
  using (public.is_admin()) with check (public.is_admin());
drop policy if exists "citizen_submissions delete" on public.citizen_submissions;
create policy "citizen_submissions delete" on public.citizen_submissions for delete to anon, authenticated
  using (public.is_admin());
