# MASTER SPEC — MARGA MULYA HUB (authoritative requirements, from the user)

Build a production-ready web app end-to-end (not tutorials/pseudocode). Must run locally, build without errors, be ready for Vercel.

Project: **Marga Mulya Hub**
Tagline: **"Informasi Desa, Potensi Lokal, dan Partisipasi Masyarakat dalam Satu Platform."**
Positioning: Website + CMS + Village Data Hub + Katalog Potensi + Community Contribution Platform (not just a village profile site).
Core values: (1) Informasi Desa — structured info; (2) Potensi Lokal — discover local potential/UMKM; (3) Partisipasi Masyarakat — citizens submit info/potential, admin verifies.

## Target users
- Warga: view info, news/agenda/announcements, potentials & facilities, submit contributions.
- Perangkat desa: manage all content via CMS without code changes (profile, data, potentials, news, agenda, announcements, gallery).
- UMKM/pengelola potensi: digital promotion (info, location, contact if available).
- Pengunjung umum: learn about the village, explore data, potentials, activities.

## Problems to solve
Scattered info; data hard to understand as tables; potentials need structure; admins must manage content without developers; community activities documented; citizens need a channel to propose info verified by admin.
**Do NOT make specific factual claims about Desa Marga Mulya not supported by the reference data.**

## Competition requirements
- All public content in Bahasa Indonesia. Responsive mobile/tablet/laptop/desktop. Publicly accessible via Vercel.
- Max 10 public routes (admin not counted). Must have Beranda, Profil Desa, Informasi Desa, Galeri, Kontak.
- Fully functional CMS: create, read, update, publish, delete; draft/published status. Substantive content from DB/CMS; CMS changes reflected publicly.
- Dummy data must follow the structure/information of **EcoQuestData Desa Marga Mulya**. Don't fabricate specifics; don't use other villages' data; no SARA/inappropriate content.
- Respect licenses of libraries, images, fonts, icons, maps; add attribution where required.
- Generic UI text (Simpan, Batal, Edit, Hapus, Lihat Selengkapnya) may be in source. Village data (profile, stats, news, agenda, announcements, potentials, gallery, contact, info) must NOT be hardcoded.

## Tech stack
Next.js App Router, TypeScript strict, Tailwind CSS, shadcn/ui (or equivalent accessible), Supabase PostgreSQL + Auth + Storage, Leaflet + OpenStreetMap, Recharts, Lucide React, Zod, React Hook Form, Vercel. No paid services as core dependency. All credentials via env vars; create `.env.example`; never commit secrets.

## Public routes (max 9)
1. `/` Beranda  2. `/profil`  3. `/data-desa` (Village Data Hub)  4. `/potensi` (catalog + map)  5. `/potensi/[slug]`  6. `/informasi`  7. `/informasi/[slug]`  8. `/galeri`  9. `/kontak` (contact + citizen contribution). No extra public routes without strong reason. (sitemap.xml/robots.txt are metadata files, fine.)

## Homepage
Responsive navbar; hero (village name, hero title, description, image); CTAs "Jelajahi Desa" and "Lihat Potensi"; short stats; active announcements; featured potentials; upcoming agenda; map preview; latest news; citizen contribution CTA; contact/footer. Substantive content from DB.

## /profil
Dynamic if available: identity, description, history, vision, mission, geography, government structure (officials), public facilities, photos. Don't invent missing info.

## /data-desa (PRIORITY 1)
Main stats, stat cards, Recharts charts (bar/line/pie/donut per data), year filter & category filter if data supports, data source, data year, alternative table/text representation. Not just a spreadsheet. All values and chart config from DB.

## /potensi — "Jelajah Potensi Desa" (PRIORITY 2)
Responsive card catalog, search, category filter, photo, name, category, short description, location, contact if available, featured. Interactive Leaflet + OSM map; markers from DB; filterable by category.

## /potensi/[slug]
Photo, name, category, summary, full description, manager if available, address, coordinates, contact, WhatsApp, operating hours, social media, map, contact CTA. SEO-friendly slug.

## /informasi
Combine news, announcements, agenda, services. Tabs/filter: Semua, Berita, Pengumuman, Agenda, Layanan. Search, date filter, status, priority announcement. Announcements have start_date/end_date; expired announcements must not show as active. Agenda shows date, time, location, organizer, description.

## /informasi/[slug]
Title, cover, type, date, body, location/organizer if relevant, related information.

## /galeri
Responsive grid, category filter, lightbox/dialog, title, description, date, location, alt text, lazy loading.

## /kontak
Address, phone/WhatsApp, email, service hours, social media, location map, navigation button, contact form (saves to DB for CMS processing).

## Kontribusi Warga (PRIORITY 3) — on /kontak
Fields: name, optional contact, category (Potensi Lokal, Kegiatan Masyarakat, Infrastruktur, Lingkungan, Informasi Lainnya), title, description, optional photo, optional location, optional lat/lng.
Workflow: submit → pending → admin review → approved/rejected → approved content can be published. Never auto-publish.

## Admin / CMS — `/admin` (protected)
Modules: Dashboard, Pengaturan Website, Profil Desa, Data Desa, Potensi, Berita, Pengumuman, Agenda, Galeri, Pesan Kontak, Kontribusi Warga, Logout. Connected to Supabase.
Each content module: CRUD, draft/published, validation, delete confirmation, success/error feedback, image preview, search, basic filter, created/updated timestamps.
Dashboard: total content, active announcements, upcoming events, pending submissions, recent content. No complex page builder; simple stable editor.

## Database (Supabase Postgres) — tables (with created_at/updated_at where relevant)
- admin_users
- site_settings: village_name, tagline, short_description, hero_title, hero_description, hero_image_url, address, phone, whatsapp, email, service_hours, latitude, longitude, social_links
- village_profiles: village_name, description, history, vision, mission, geography, facilities, hero_image_url, status
- officials: name, position, photo_url, display_order, status
- village_statistics: category, indicator, value, unit, year, chart_type, display_order, is_published (also add source field for data source)
- information_posts: title, slug, excerpt, content, type (news|announcement|event|service), cover_image_url, event_date, event_time, location, organizer, priority, start_date, end_date, status, published_at
- potentials: name, slug, category, summary, description, image_url, owner_or_manager, address, latitude, longitude, contact, whatsapp, operating_hours, social_links, is_featured, status
- gallery_items: title, description, image_url, alt_text, category, event_date, location, status
- contact_messages: name, contact, subject, message, status (unread|read|archived)
- citizen_submissions: submitter_name, contact, category, title, description, image_url, location, latitude, longitude, status (pending|approved|rejected), admin_notes, reviewed_at

## Auth & security
Supabase Auth; protected admin routes; RLS; public reads only published content; public can insert contact messages & citizen submissions; only authenticated admins modify content; client+server validation (Zod); rich-text sanitization; file type & size validation; never expose service-role key; no manual password storage; honeypot spam protection; never expose private submitter contact info publicly.

## Smart Search (PRIORITY 4, after core + CMS)
Covers news, announcements, agenda, potentials, services; results grouped by type; DB-driven.

## Optional AI "Tanya Marga Mulya" — ONLY after everything else is stable. Must use DB data only, cite site links, say data unavailable when missing, site works without API key, key server-side only. Skip if not time-justified.

## Design system — "Modern Indonesian Village"
Modern, natural, friendly, professional; not generic SaaS; mobile-first; village imagery; good whitespace; proportional rounded cards; simple icons; subtle animation. Palette: Deep Green, Light Green, Warm Off-White, Natural Yellow/Orange, Dark Charcoal. CSS variables/design tokens. Max 2 legal fonts via next/font. Avoid excessive animation/gradients, dense layouts, tiny fonts, low contrast, carousels, stock-heavy look, dominant admin look, unlicensed assets.

## Accessibility (WCAG 2.1 AA basics)
Semantic HTML, skip-to-content, alt text, labels, screen-reader-friendly validation, keyboard nav, visible focus, contrast, not color-only info, chart table alternatives, prefers-reduced-motion, ~44×44 touch targets, correct ARIA, 320px→desktop, no horizontal scroll.

## Performance & SEO
next/image, lazy loading, Server Components, dynamic import Leaflet (ssr:false), loading/empty/error/not-found states, dynamic metadata, sitemap, robots.txt, SEO slugs. Site must remain usable if map fails. Minimize client JS.

## EcoQuestData
Use EcoQuestData Desa Marga Mulya as the primary seed source: read it, identify structure, map to schema, seed. **If the document is unavailable/unreadable, do NOT fabricate data — use clearly neutral placeholders and document the limitation in README.**

## Dynamic requirement (critical)
CMS → Supabase → Public site. Hero title edits show on homepage; new potential appears publicly; new published news appears in /informasi; stat edits change charts. No hardcoded arrays as primary public data source.

## Images
Supabase Storage: upload, preview, replace, delete. URLs stored in DB. Optimized display; alt text.

## Implementation order
Phase 1 Foundation (Next.js, TS, Tailwind, shadcn, tokens, Supabase, migrations, seed, .env.example) → Phase 2 Core (auth, admin protection, CMS CRUD, public layout, 9 routes, DB integration, image upload, responsive) → Phase 3 Innovation (Data Hub, catalog, map, smart search, contribution, moderation) → Phase 4 Quality (responsive, a11y, states, lint, typecheck, build, fix all, Vercel readiness) → Phase 5 optional AI.

## Documentation
README.md, .env.example, database/migrations/, database/seed/. README: overview, features, stack, folder structure, install, env vars, Supabase setup, migrations, seed, admin setup, local dev, Vercel deploy, asset licenses, known limitations. No pitch decks.

## Testing & build verification
Test all public pages, CMS (login/logout/dashboard/create/edit/publish/unpublish/delete/upload/search/filter), CMS→DB→public, citizen workflow, search, map, mobile/desktop, keyboard, validation, RLS, error/loading/empty states.
Run `npm run lint`, `npm run typecheck`, `npm run build`; fix all errors.

## Acceptance criteria
Runs locally; build succeeds; ≤10 public routes; required pages; Indonesian content; responsive; admin login; CMS CRUD; persisted in Supabase; CMS changes appear publicly; stats from DB; persistent image storage; CMS-managed map coordinates; drafts hidden; expired announcements inactive; submissions moderated; admin protected; no secrets committed; no hardcoded village data; form validation; keyboard nav; no horizontal scroll; licensing/attribution; README; migration; seed; Vercel-ready.

## Final report
What was implemented; routes; CMS modules; tables; innovation features; key files; env vars; lint/typecheck/build results; Vercel steps; known limitations; acceptance checklist with honest status. Never claim untested features complete; clearly state anything blocked by missing credentials/data/services.
