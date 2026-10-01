import type { Metadata } from "next";
import { NotFoundContent } from "@/components/layout/not-found-content";

export const metadata: Metadata = { title: "Halaman tidak ditemukan" };

// 404 for notFound() in public detail pages, rendered inside the public layout (design D14).
export default function PublicNotFound() {
  return <NotFoundContent />;
}
