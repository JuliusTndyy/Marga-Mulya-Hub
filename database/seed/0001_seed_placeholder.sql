-- =============================================================================
-- Marga Mulya Hub — 0001_seed_placeholder.sql  (design D11)
--
-- EcoQuestData Desa Marga Mulya is NOT available in this workspace, so this seed
-- contains NO village facts. Every substantive value is the neutral placeholder
--   '[Data belum tersedia — perbarui melalui CMS]'
-- or is clearly marked as sample data ("[Contoh]" titles, is_sample = true statistics,
-- "Data contoh" source text). Coordinates, phone numbers, emails and images are NULL.
--
-- IDEMPOTENT: re-running never overwrites CMS edits
--   * on conflict do nothing for natural keys (site_settings id, statistics triple, slugs)
--   * where not exists for village_profiles and officials
-- Dates are relative to current_date so the demo announcement states stay correct.
-- Run after 0001–0003 migrations, in the Supabase SQL editor.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- site_settings — ganti dengan EcoQuestData (alamat, kontak, jam layanan, koordinat)
-- village_name and tagline were given by the user; everything else is a placeholder.
-- -----------------------------------------------------------------------------
insert into public.site_settings
  (id, village_name, tagline, short_description, hero_title, hero_description, hero_image_url,
   address, phone, whatsapp, email, service_hours, latitude, longitude, social_links)
values
  (1, 'Desa Marga Mulya',
   'Informasi Desa, Potensi Lokal, dan Partisipasi Masyarakat dalam Satu Platform.',
   '[Data belum tersedia — perbarui melalui CMS]',
   'Selamat Datang di Desa Marga Mulya',
   '[Data belum tersedia — perbarui melalui CMS]',
   null,
   '[Data belum tersedia — perbarui melalui CMS]',
   null, null, null,
   '[Data belum tersedia — perbarui melalui CMS]',
   null, null, '[]'::jsonb)
on conflict (id) do nothing;

-- -----------------------------------------------------------------------------
-- village_profiles — ganti dengan EcoQuestData (deskripsi, sejarah, visi, misi, geografi, fasilitas)
-- -----------------------------------------------------------------------------
insert into public.village_profiles
  (village_name, description, history, vision, mission, geography, facilities, hero_image_url, status)
select 'Desa Marga Mulya',
       '[Data belum tersedia — perbarui melalui CMS]',
       '[Data belum tersedia — perbarui melalui CMS]',
       '[Data belum tersedia — perbarui melalui CMS]',
       '[Data belum tersedia — perbarui melalui CMS]',
       '[Data belum tersedia — perbarui melalui CMS]',
       '[Data belum tersedia — perbarui melalui CMS]',
       null, 'published'
where not exists (select 1 from public.village_profiles);

-- -----------------------------------------------------------------------------
-- officials — ganti dengan EcoQuestData (nama perangkat desa)
-- Only the two positions every Indonesian desa has by law; names are placeholders.
-- -----------------------------------------------------------------------------
insert into public.officials (name, position, photo_url, display_order, status)
select v.name, v.position, null, v.display_order, 'published'
from (values
  ('[Nama belum tersedia]', 'Kepala Desa', 1),
  ('[Nama belum tersedia]', 'Sekretaris Desa', 2)
) as v(name, position, display_order)
where not exists (select 1 from public.officials);

-- -----------------------------------------------------------------------------
-- village_statistics — ganti dengan EcoQuestData (set is_sample = false on real data)
-- Round, obviously illustrative values. Totals agree with the gender split.
-- Only Jumlah Penduduk / Total / 2024 is highlighted. Sector names are neutral.
-- -----------------------------------------------------------------------------
insert into public.village_statistics
  (category, indicator, value, unit, year, chart_type, display_order, is_published, source, is_sample, is_highlight)
values
  ('Jumlah Penduduk',  'Total',           190, 'jiwa', 2022, 'line', 10, true, 'Data contoh — bukan data resmi. Ganti dengan EcoQuestData Desa Marga Mulya.', true, false),
  ('Jumlah Penduduk',  'Total',           200, 'jiwa', 2023, 'line', 10, true, 'Data contoh — bukan data resmi. Ganti dengan EcoQuestData Desa Marga Mulya.', true, false),
  ('Jumlah Penduduk',  'Total',           220, 'jiwa', 2024, 'line', 10, true, 'Data contoh — bukan data resmi. Ganti dengan EcoQuestData Desa Marga Mulya.', true, true),
  ('Kependudukan',     'Laki-laki',       100, 'jiwa', 2023, 'pie',  20, true, 'Data contoh — bukan data resmi. Ganti dengan EcoQuestData Desa Marga Mulya.', true, false),
  ('Kependudukan',     'Perempuan',       100, 'jiwa', 2023, 'pie',  21, true, 'Data contoh — bukan data resmi. Ganti dengan EcoQuestData Desa Marga Mulya.', true, false),
  ('Kependudukan',     'Laki-laki',       110, 'jiwa', 2024, 'pie',  20, true, 'Data contoh — bukan data resmi. Ganti dengan EcoQuestData Desa Marga Mulya.', true, false),
  ('Kependudukan',     'Perempuan',       110, 'jiwa', 2024, 'pie',  21, true, 'Data contoh — bukan data resmi. Ganti dengan EcoQuestData Desa Marga Mulya.', true, false),
  ('Mata Pencaharian', 'Sektor Contoh A',  40, 'jiwa', 2024, 'bar',  30, true, 'Data contoh — bukan data resmi. Ganti dengan EcoQuestData Desa Marga Mulya.', true, false),
  ('Mata Pencaharian', 'Sektor Contoh B',  30, 'jiwa', 2024, 'bar',  31, true, 'Data contoh — bukan data resmi. Ganti dengan EcoQuestData Desa Marga Mulya.', true, false),
  ('Mata Pencaharian', 'Sektor Contoh C',  20, 'jiwa', 2024, 'bar',  32, true, 'Data contoh — bukan data resmi. Ganti dengan EcoQuestData Desa Marga Mulya.', true, false),
  ('Mata Pencaharian', 'Sektor Contoh D',  10, 'jiwa', 2024, 'bar',  33, true, 'Data contoh — bukan data resmi. Ganti dengan EcoQuestData Desa Marga Mulya.', true, false)
on conflict (category, indicator, year) do nothing;

-- -----------------------------------------------------------------------------
-- information_posts — ganti dengan EcoQuestData (berita, pengumuman, agenda, layanan)
-- published_at and sort_date are set by the information_posts_derive() trigger.
-- -----------------------------------------------------------------------------
insert into public.information_posts
  (slug, type, title, excerpt, content, cover_image_url, priority, start_date, end_date,
   event_date, event_time, location, organizer, status)
values
  ('contoh-berita', 'news', '[Contoh] Berita Desa',
   '[Data belum tersedia — perbarui melalui CMS]', '<p>[Data belum tersedia — perbarui melalui CMS]</p>', null,
   0, null, null, null, null, null, null, 'published'),
  ('contoh-pengumuman', 'announcement', '[Contoh] Pengumuman Aktif',
   '[Data belum tersedia — perbarui melalui CMS]', '<p>[Data belum tersedia — perbarui melalui CMS]</p>', null,
   1, current_date, current_date + 30, null, null, null, null, 'published'),
  ('contoh-pengumuman-berakhir', 'announcement', '[Contoh] Pengumuman Berakhir',
   '[Data belum tersedia — perbarui melalui CMS]', '<p>[Data belum tersedia — perbarui melalui CMS]</p>', null,
   0, current_date - 31, current_date - 1, null, null, null, null, 'published'),
  ('contoh-agenda', 'event', '[Contoh] Agenda Kegiatan',
   '[Data belum tersedia — perbarui melalui CMS]', '<p>[Data belum tersedia — perbarui melalui CMS]</p>', null,
   0, null, null, current_date + 14, '08:00',
   '[Data belum tersedia — perbarui melalui CMS]', '[Data belum tersedia — perbarui melalui CMS]', 'published'),
  ('contoh-layanan', 'service', '[Contoh] Informasi Layanan',
   '[Data belum tersedia — perbarui melalui CMS]', '<p>[Data belum tersedia — perbarui melalui CMS]</p>', null,
   0, null, null, null, null, null, null, 'published')
on conflict (slug) do nothing;

-- -----------------------------------------------------------------------------
-- potentials — ganti dengan EcoQuestData (potensi dan UMKM nyata, koordinat, kontak)
-- No seeded potential names a specific sector as the village's highlight.
-- -----------------------------------------------------------------------------
insert into public.potentials
  (slug, name, category, summary, description, address, image_url, latitude, longitude,
   contact, whatsapp, is_featured, status)
values
  ('contoh-potensi-lokal', '[Contoh] Potensi Lokal', 'Lainnya',
   '[Data belum tersedia — perbarui melalui CMS]', '[Data belum tersedia — perbarui melalui CMS]',
   '[Data belum tersedia — perbarui melalui CMS]', null, null, null, null, null, true, 'published'),
  ('contoh-umkm-lokal', '[Contoh] UMKM Lokal', 'UMKM',
   '[Data belum tersedia — perbarui melalui CMS]', '[Data belum tersedia — perbarui melalui CMS]',
   '[Data belum tersedia — perbarui melalui CMS]', null, null, null, null, null, false, 'published')
on conflict (slug) do nothing;

-- -----------------------------------------------------------------------------
-- gallery_items, contact_messages, citizen_submissions — intentionally empty.
-- Images can't be seeded without licensed photos; messages/submissions come from the public.
-- -----------------------------------------------------------------------------
