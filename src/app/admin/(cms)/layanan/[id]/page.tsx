import type { Metadata } from "next";
import { PostEditPage } from "@/components/admin/post-pages";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Edit Layanan" };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function Page({ params }: PageProps) {
  return <PostEditPage type="service" params={params} />;
}
