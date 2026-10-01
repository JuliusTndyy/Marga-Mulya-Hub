import type { Metadata } from "next";
import { PostListPage } from "@/components/admin/post-pages";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Layanan" };

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default function Page({ searchParams }: PageProps) {
  return <PostListPage type="service" searchParams={searchParams} />;
}
