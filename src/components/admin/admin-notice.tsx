// Unconfigured / error states for admin pages (design D6 wording).
export function AdminNotice({ reason }: { reason: "unconfigured" | "error" }) {
  return (
    <div role="alert" className="rounded-xl border bg-card p-6 text-sm">
      {reason === "unconfigured"
        ? "Layanan data belum dikonfigurasi. Hubungi pengelola situs."
        : "Data gagal dimuat. Silakan muat ulang halaman."}
    </div>
  );
}
