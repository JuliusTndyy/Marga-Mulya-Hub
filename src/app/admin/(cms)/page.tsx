import type { Metadata } from "next";
import Link from "next/link";
import { AdminNotice } from "@/components/admin/admin-notice";
import { requireAdmin } from "@/lib/auth";
import { getDashboardCounts } from "@/lib/data/admin/dashboard";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Dashboard" };

function CountCard({ label, value, href }: { label: string; value: number | null; href: string }) {
  return (
    <li>
      <Link
        href={href}
        className="flex min-h-24 flex-col justify-between rounded-xl border bg-card p-5 shadow-sm transition-colors hover:border-primary"
      >
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="font-heading text-3xl font-bold">{value === null ? "—" : value}</span>
      </Link>
    </li>
  );
}

// Count cards linking to their modules (scope simplification S10: no recent-content list).
export default async function DashboardPage() {
  await requireAdmin();
  const counts = await getDashboardCounts();

  return (
    <div className="grid gap-6">
      <h1 className="font-heading text-2xl font-bold">Dashboard</h1>
      {counts.ok ? (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Ringkasan konten">
          <CountCard label="Kontribusi menunggu" value={counts.data.pendingSubmissions} href="/admin/kontribusi" />
          <CountCard label="Pesan kontak" value={counts.data.messages} href="/admin/pesan" />
          <CountCard label="Pengumuman aktif" value={counts.data.activeAnnouncements} href="/admin/pengumuman" />
          <CountCard label="Agenda mendatang" value={counts.data.upcomingEvents} href="/admin/agenda" />
          <CountCard label="Potensi" value={counts.data.potentials} href="/admin/potensi" />
          <CountCard label="Berita" value={counts.data.posts.news} href="/admin/berita" />
          <CountCard label="Pengumuman" value={counts.data.posts.announcement} href="/admin/pengumuman" />
          <CountCard label="Agenda" value={counts.data.posts.event} href="/admin/agenda" />
          <CountCard label="Layanan" value={counts.data.posts.service} href="/admin/layanan" />
          <CountCard label="Foto galeri" value={counts.data.gallery} href="/admin/galeri" />
          <CountCard label="Data statistik" value={counts.data.statistics} href="/admin/data-desa" />
          <CountCard label="Perangkat desa" value={counts.data.officials} href="/admin/perangkat" />
        </ul>
      ) : (
        <AdminNotice reason={counts.reason} />
      )}
    </div>
  );
}
