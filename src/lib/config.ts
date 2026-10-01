export const SITE_TIMEZONE = "Asia/Jakarta"; // keep in sync with information_posts_derive() in 0001_schema.sql
export const POTENTIAL_CATEGORIES = ["Pertanian","Perkebunan","Peternakan","Perikanan","UMKM","Kuliner","Kerajinan","Wisata","Jasa","Lainnya"] as const;
export const GALLERY_CATEGORIES = ["Kegiatan","Infrastruktur","Alam","Budaya","UMKM","Lainnya"] as const;
export const SUBMISSION_CATEGORIES = ["Potensi Lokal","Kegiatan Masyarakat","Infrastruktur","Lingkungan","Informasi Lainnya"] as const;
export const POST_TYPES = { news: "Berita", announcement: "Pengumuman", event: "Agenda", service: "Layanan" } as const;
export const PRIORITY_LABELS = { 0: "Biasa", 1: "Penting", 2: "Mendesak" } as const;
export const SOCIAL_PLATFORMS = ["facebook","instagram","youtube","tiktok","x","website"] as const;
export const PAGE_SIZE = { public: 12, gallery: 60, admin: 20 } as const;
export const UPLOAD_LIMITS = { mediaBytes: 5 * 1024 * 1024, submissionBytes: 3 * 1024 * 1024,
  mimeTypes: ["image/jpeg","image/png","image/webp"] } as const;
export const SPAM_MIN_FILL_MS = 3000;
export const RICH_TEXT_LIMITS = { inputChars: 50_000, storedChars: 60_000 } as const; // mirrors DB CHECKs (D8)
