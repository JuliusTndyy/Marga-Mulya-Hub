-- =============================================================================
-- Marga Mulya Hub — 0003_storage.sql
-- Storage buckets + storage.objects policies (design D10). Run after 0002_rls.sql.
--
-- FULLY RE-RUNNABLE: the bucket upsert uses on conflict ... do update, and every
-- policy is dropped before it is created.
--   media        public bucket, admin writes only, 5 MB, jpeg/png/webp   ({module}/{uuid}.{ext})
--   submissions  private bucket, written server-side with the service role, 3 MB (pending/{uuid}.{ext})
-- No bucket has an anon write policy.
-- =============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('media', 'media', true, 5242880, array['image/jpeg','image/png','image/webp']),
  ('submissions', 'submissions', false, 3145728, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "media public read" on storage.objects;
create policy "media public read" on storage.objects for select to anon, authenticated using (bucket_id = 'media');
drop policy if exists "media admin insert" on storage.objects;
create policy "media admin insert" on storage.objects for insert to authenticated with check (bucket_id = 'media' and public.is_admin());
drop policy if exists "media admin update" on storage.objects;
create policy "media admin update" on storage.objects for update to authenticated using (bucket_id = 'media' and public.is_admin());
drop policy if exists "media admin delete" on storage.objects;
create policy "media admin delete" on storage.objects for delete to authenticated using (bucket_id = 'media' and public.is_admin());
drop policy if exists "submissions admin read" on storage.objects;
create policy "submissions admin read" on storage.objects for select to authenticated using (bucket_id = 'submissions' and public.is_admin());
drop policy if exists "submissions admin delete" on storage.objects;
create policy "submissions admin delete" on storage.objects for delete to authenticated using (bucket_id = 'submissions' and public.is_admin());
