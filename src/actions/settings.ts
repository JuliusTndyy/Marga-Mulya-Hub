"use server";

import { revalidatePath } from "next/cache";
import { adminClient, invalidForm, SESSION_EXPIRED } from "@/lib/admin-action";
import { mapDbError, type ActionResult } from "@/lib/result";
import { removeMediaObject } from "@/lib/storage";
import { settingsSchema } from "@/lib/validation/settings";

// Upserts the site_settings singleton (id = 1). There is no delete policy for this table.
export async function saveSettings(input: unknown): Promise<ActionResult<{ id: string }>> {
  const sb = await adminClient();
  if (!sb) return SESSION_EXPIRED;
  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) return invalidForm(parsed.error);

  const { data: prev, error: prevError } = await sb
    .from("site_settings")
    .select("hero_image_url")
    .eq("id", 1)
    .maybeSingle<{ hero_image_url: string | null }>();
  if (prevError) return mapDbError("saveSettings", prevError);

  const { error } = await sb.from("site_settings").upsert({ id: 1, ...parsed.data }).select("id").single();
  if (error) return mapDbError("saveSettings", error);

  if (prev?.hero_image_url && prev.hero_image_url !== parsed.data.hero_image_url) {
    await removeMediaObject(sb, prev.hero_image_url);
  }
  revalidatePath("/", "layout");
  revalidatePath("/admin/pengaturan");
  return { ok: true, message: "Pengaturan berhasil disimpan.", data: { id: "1" } };
}
