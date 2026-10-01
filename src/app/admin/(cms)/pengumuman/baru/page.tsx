import type { Metadata } from "next";
import { PostCreatePage } from "@/components/admin/post-pages";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Tambah Pengumuman" };

export default function Page() {
  return <PostCreatePage type="announcement" />;
}
