# Marga Mulya Hub

> Informasi Desa, Potensi Lokal, dan Partisipasi Masyarakat dalam Satu Platform.

## Ringkasan

Marga Mulya Hub adalah situs web dan CMS desa berbahasa Indonesia: informasi desa, Village Data Hub (grafik dari database), katalog potensi lokal, dan kanal kontribusi warga dengan moderasi admin. Semua konten substantif berasal dari Supabase (Postgres, Auth, Storage) dan dikelola lewat `/admin`. Aplikasi tetap bisa di-build dan dijalankan tanpa kredensial Supabase; halaman publik lalu menampilkan pemberitahuan "Layanan data belum dikonfigurasi".

## Fitur

- 9 halaman publik: Beranda, Profil, Data Desa, Potensi (+ detail), Informasi (+ detail), Galeri, Kontak.
- Data Desa: kartu sorotan, grafik batang per kategori (tahun terbaru), ringkasan teks `role="img"`, dan tabel data di `<details>`. Data contoh ditandai "Data contoh".
- Katalog potensi: pencarian, filter kategori, lokasi sebagai daftar + tautan "Petunjuk Arah" (Google Maps).
- Informasi: tab Semua/Berita/Pengumuman/Agenda/Layanan, pencarian, paginasi; pengumuman kedaluwarsa tidak tampil aktif.
- Kontak: formulir pesan dan formulir Kontribusi Warga (teks saja), keduanya dengan honeypot dan batas waktu isi minimum.
- CMS: Dashboard, Pengaturan Website, Profil Desa, Perangkat Desa, Data Desa, Potensi, Berita, Pengumuman, Agenda, Layanan, Galeri, Pesan Kontak, Kontribusi Warga (setujui/tolak + catatan), Logout. Draf/terbit, validasi, konfirmasi hapus, unggah gambar.
- SEO: metadata per halaman, `sitemap.xml`, `robots.txt`, favicon SVG.

## Teknologi

| Paket | Versi | Lisensi |
|---|---|---|
| Next.js (App Router) | 16.3.8 | MIT |
| React / React DOM | 19.3.0 | MIT |
| TypeScript | 5.9.3 | Apache-2.0 |
| Tailwind CSS | 4.3.3 | MIT |
| shadcn/ui (via `radix-ui`) | 1.6.7 | MIT |
| @supabase/supabase-js / @supabase/ssr | 2.117.2 / 0.12.7 | MIT |
| Recharts | 3.10.1 | MIT |
| Leaflet (terpasang, belum dipakai) | 1.9.4 | BSD-2-Clause |
| lucide-react | 1.49.0 | ISC |
| Zod | 4.6.5 | MIT |
| React Hook Form / @hookform/resolvers | 7.89.0 / 5.9.1 | MIT |
| sanitize-html | 2.18.0 | MIT |
| sonner | 2.0.8 | MIT |
| Vitest / PGlite (uji) | 5.0.3 / 0.5.8 | MIT / Apache-2.0 |

Semua versi dipin persis (`.npmrc` berisi `save-exact=true`).

## Struktur folder

```
database/
  migrations/      0001_schema.sql, 0002_rls.sql, 0003_storage.sql
  seed/            0001_seed_placeholder.sql, admin_bootstrap.sql
  sql.test.ts      uji SQL/RLS dengan PGlite
src/
  app/(public)/    9 halaman publik + layout, error, not-found
  app/admin/       login + (cms)/ modul CMS
  app/             layout root, sitemap.ts, robots.ts, icon.svg
  actions/         server actions (admin + formulir publik)
  components/      ui/ (shadcn), public/, admin/, forms/, charts/, layout/, map/
  lib/             env, config, data/ (lapisan baca), validation/, forms/, supabase/, utilitas murni + uji
  types/db.ts      tipe baris database
```

## Persyaratan

Node.js 22.12+ atau 24 (LTS) dan npm.

## Instalasi

```bash
npm install
```

Di Windows PowerShell yang memblokir `npm.ps1`, gunakan `npm.cmd install` (dan `npm.cmd run ...`).

## Variabel lingkungan

Salin `.env.example` menjadi `.env.local`, lalu isi:

| Variabel | Wajib | Keterangan |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ya | URL proyek Supabase (Settings → API) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ya | Kunci anon/publishable |
| `SUPABASE_SERVICE_ROLE_KEY` | tidak | Hanya server. Jangan diberi awalan `NEXT_PUBLIC_`. Disiapkan untuk unggah foto warga (belum aktif, lihat Keterbatasan) |
| `NEXT_PUBLIC_SITE_URL` | disarankan | URL publik untuk metadata, sitemap, robots |

Jangan pernah meng-commit `.env.local`.

## Setup Supabase

1. Buat proyek di Supabase, salin URL dan anon key ke `.env.local`.
2. Authentication → Providers: aktifkan Email.
3. Authentication → Sign In / Providers: **matikan "Allow new users to sign up"**.

## Migrasi

Jalankan di SQL Editor, berurutan:

1. `database/migrations/0001_schema.sql`: sekali saja pada proyek baru. Perubahan skema berikutnya dibuat sebagai file bernomor baru.
2. `database/migrations/0002_rls.sql`: aman dijalankan ulang. **Jalankan ulang setelah menambah tabel baru.**
3. `database/migrations/0003_storage.sql`: aman dijalankan ulang (bucket `media` publik dan `submissions` privat).

## Seed

`database/seed/0001_seed_placeholder.sql` berisi placeholder netral (`[Data belum tersedia — perbarui melalui CMS]`, judul "[Contoh]", statistik `is_sample = true`). Seed idempoten dan tidak menimpa hasil edit CMS.

Mengganti dengan EcoQuestData Desa Marga Mulya (per tabel):
- `site_settings`: nama desa, alamat, kontak, jam layanan, koordinat.
- `village_profiles` / `officials`: deskripsi, sejarah, visi-misi, geografi, fasilitas; perangkat desa.
- `village_statistics`: satu baris per (kategori, indikator, tahun); isi `source`, set `is_sample = false` untuk data resmi.
- `potentials`, `information_posts`, `gallery_items`: ganti baris "[Contoh]" melalui CMS.

## Setup admin

1. Matikan pendaftaran publik (lihat Setup Supabase).
2. Authentication → Users → Add user (email + kata sandi, "Auto Confirm").
3. Ganti email di `database/seed/admin_bootstrap.sql`, lalu jalankan di SQL Editor.

## Pengembangan lokal

```bash
npm run dev
```

Buka `http://localhost:3000`; CMS di `/admin`.

## Pemeriksaan kualitas

```bash
npm run lint
npm run typecheck
npm run test    # unit test + uji SQL/RLS PGlite (database/sql.test.ts)
npm run build
```

## Deploy ke Vercel

1. Import repositori ke Vercel.
2. Isi variabel lingkungan untuk Production dan Preview, termasuk `NEXT_PUBLIC_SITE_URL`.
3. Redeploy setiap kali variabel berubah, karena nilai `NEXT_PUBLIC_*` disisipkan saat build.
4. Badan request fungsi Vercel dibatasi 4,5 MB; karena itu batas foto warga direncanakan 3 MB.

## Daftar rute

- Publik: `/`, `/profil`, `/data-desa`, `/potensi`, `/potensi/[slug]`, `/informasi`, `/informasi/[slug]`, `/galeri`, `/kontak`.
- File metadata: `/sitemap.xml`, `/robots.txt`, `/icon.svg`.
- Admin: `/admin/login`, `/admin` dan seluruh modul di bawah `/admin/*` (noindex).

## Checklist uji RLS manual

Jalankan terhadap proyek Supabase sungguhan:
- [ ] anon `select` baris draf (potentials, information_posts, gallery_items) = 0 baris.
- [ ] anon `insert` ke `potentials` gagal.
- [ ] anon `select` dari `citizen_submissions` dan `contact_messages` = 0 baris / ditolak.
- [ ] Pengguna terautentikasi non-admin tidak bisa `update` konten.
- [ ] Unggah anon ke bucket `media` gagal.
- [ ] Pencarian dua kata (dengan spasi) di `/informasi?q=` mengembalikan hasil. Jika tidak, beri tanda kutip ganda pada nilai PostgREST (`title.ilike."*${t}*"`) di `src/lib/data/posts.ts`; `normalizeSearchTerm` sudah membuang `"`.
- [ ] `curl -I /potensi/tidak-ada` → 404.
- [ ] Alur CMS → publik: ubah judul hero, tambah potensi terbit, terbitkan berita, ubah statistik; semuanya tampil di situs. Draf tidak tampil.
- [ ] Kirim Kontribusi Warga → muncul `pending` di `/admin/kontribusi` → Setujui/Tolak tersimpan dengan catatan; tidak ada yang terbit otomatis.

## Lisensi aset

- Pustaka: lihat tabel Teknologi (MIT, ISC, Apache-2.0, BSD-2-Clause).
- `react-leaflet` sengaja tidak dipakai.
- Font Plus Jakarta Sans dan Inter: SIL Open Font License 1.1, di-host sendiri via `next/font`.
- Ikon Lucide: ISC.
- OpenStreetMap: data ODbL; jika peta interaktif diaktifkan nanti, wajib atribusi "© kontributor OpenStreetMap" dan patuhi Tile Usage Policy OSM (ganti penyedia tile bila trafik besar). Footer sudah memuat atribusi tersebut.
- Favicon dibuat sendiri. Tidak ada foto stok; semua gambar diunggah melalui CMS.

## Keterbatasan

- EcoQuestData Desa Marga Mulya tidak tersedia, sehingga seed memakai placeholder bertanda `is_sample` / "[Contoh]". Koordinat desa belum diketahui.
- Tidak ada kredensial Supabase di lingkungan pengembangan ini: alur DB/Auth/Storage hanya diuji lewat PGlite dan unit test, belum terhadap proyek sungguhan.
- Disederhanakan untuk saat ini:
  - S1: tanpa peta interaktif Leaflet; lokasi tampil sebagai daftar + "Petunjuk Arah". Paket `leaflet` terpasang tetapi belum dipakai.
  - S2: Data Desa hanya grafik batang untuk tahun terbaru per kategori; tanpa filter tahun/kategori; `chart_type` selain "Tanpa grafik" ditampilkan sebagai batang.
  - S3: moderasi kontribusi hanya Setujui/Tolak/Hapus; belum ada konversi ke draf potensi/berita.
  - S4: formulir kontribusi tanpa unggah foto.
  - S5: tanpa pencarian global (dialog/`/api/search`); pencarian tersedia per halaman di `/potensi` dan `/informasi`.
  - S6: editor konten berupa textarea biasa tanpa toolbar (HTML tetap disanitasi di server).
- Zona waktu WIB adalah konstanta di dua tempat (`src/lib/config.ts` dan `information_posts_derive()`).
- Tidak ada rate limiting. Insert langsung ke PostgREST dengan anon key melewati honeypot dan Zod; hanya CHECK/RLS database yang berlaku.
- Batas waktu isi minimum membandingkan dua stempel waktu server; kiriman dalam 3 detik setelah render `/kontak` dianggap spam secara diam-diam.
- Pemeriksaan MIME bucket mempercayai Content-Type dari klien; kebijakan Storage tidak tercakup uji otomatis.
- Fitur AI "Tanya Marga Mulya" tidak dibangun.
- Audit aksesibilitas dan tampilan 320 px dilakukan sekilas; validasi WCAG penuh memerlukan uji manual dengan teknologi asistif.
