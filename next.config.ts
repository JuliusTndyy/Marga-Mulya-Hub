import type { NextConfig } from "next";
const supabaseHost = (() => {
  try { return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").hostname; } catch { return null; }
})();
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
      ...(supabaseHost && !supabaseHost.endsWith(".supabase.co")
        ? [{ protocol: "https" as const, hostname: supabaseHost, pathname: "/storage/v1/object/public/**" }]
        : []),
    ],
  },
  experimental: {
    // Citizen photo (≤ 3 MB) + text fields travel in one Server Action FormData.
    // Default is 1 MB. 4 MB stays below Vercel's 4.5 MB function request-body cap.
    serverActions: { bodySizeLimit: "4mb" },
  },
  poweredByHeader: false,
};
export default nextConfig;
