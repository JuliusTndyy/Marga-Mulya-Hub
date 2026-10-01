// Environment readers (design D6). None of these throw; missing config yields null/false.

export function getPublicSupabaseEnv(): { url: string; anonKey: string } | null {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!raw || !anonKey) return null;
  try {
    new URL(raw);
  } catch {
    return null;
  }
  return { url: raw.replace(/\/+$/, ""), anonKey }; // normalized: no trailing slash
}

export const isSupabaseConfigured = () => getPublicSupabaseEnv() !== null;

export const getPhotoUploadEnabled = () =>
  isSupabaseConfigured() && !!process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercel) return `https://${vercel.replace(/\/+$/, "")}`;
  return "http://localhost:3000";
}
