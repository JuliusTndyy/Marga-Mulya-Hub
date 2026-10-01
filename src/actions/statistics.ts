"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { deleteRowById, NOT_FOUND, plain, saveRecord, updateRowById } from "@/lib/admin-action";
import type { ActionResult } from "@/lib/result";
import { statisticSchema } from "@/lib/validation/statistic";

function revalidate() {
  revalidatePath("/data-desa");
  revalidatePath("/");
  revalidatePath("/admin/data-desa");
}

// 23505 on (category, indicator, year) → field errors on indicator/year (mapDbError statistics flag).
export async function saveStatistic(input: unknown, id?: unknown): Promise<ActionResult<{ id: string }>> {
  const res = await saveRecord({
    fn: "saveStatistic", table: "village_statistics", schema: statisticSchema, input, id, statistics: true,
  });
  if (!res.ok) return res;
  revalidate();
  return { ...res, message: "Data statistik berhasil disimpan." };
}

export async function setStatisticPublished(id: unknown, published: unknown): Promise<ActionResult> {
  const p = z.boolean().safeParse(published);
  if (!p.success) return NOT_FOUND;
  const res = await updateRowById("setStatisticPublished", "village_statistics", id, { is_published: p.data });
  if (res.ok) revalidate();
  return plain(res, p.data ? "Data diterbitkan." : "Data dijadikan draf.");
}

export async function deleteStatistic(id: unknown): Promise<ActionResult> {
  const res = await deleteRowById("deleteStatistic", "village_statistics", id);
  if (res.ok) revalidate();
  return plain(res, "Data statistik berhasil dihapus.");
}
