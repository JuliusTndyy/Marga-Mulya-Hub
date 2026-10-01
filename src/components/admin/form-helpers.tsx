"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FieldValues, Path, UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { ActionResult } from "@/lib/result";

export type SaveAction<TOut> = (input: TOut, id?: string) => Promise<ActionResult<{ id: string }>>;

const INVALID = "Periksa kembali isian formulir.";

/**
 * Generic admin form submit (design D18): call the server action with the typed values,
 * toast the result, then router.push to the list (create) or router.refresh() (edit).
 * Server field errors are applied with setError; a role="alert" summary is kept in state.
 */
export function useAdminSubmit<TIn extends FieldValues, TOut>(
  form: UseFormReturn<TIn, unknown, TOut>,
  action: SaveAction<TOut>,
  opts: { id?: string; listHref: string },
) {
  const router = useRouter();
  const [summary, setSummary] = useState<string | null>(null);

  const onValid = async (values: TOut) => {
    setSummary(null);
    let res: ActionResult<{ id: string }>;
    try {
      res = await action(values, opts.id);
    } catch {
      res = { ok: false, message: "Gagal menyimpan data." };
    }
    if (res.ok) {
      toast.success(res.message);
      if (opts.id) router.refresh();
      else router.push(opts.listHref);
      return;
    }
    toast.error(res.message);
    setSummary(res.message);
    for (const [name, messages] of Object.entries(res.fieldErrors ?? {})) {
      if (messages?.[0]) form.setError(name as Path<TIn>, { type: "server", message: messages[0] }, { shouldFocus: true });
    }
  };
  const onInvalid = () => setSummary(INVALID);

  return { summary, onValid, onInvalid, submit: form.handleSubmit(onValid, onInvalid) };
}

export function FormSummary({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div role="alert" className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
      {message}
    </div>
  );
}

interface SaveButtonsProps {
  pending: boolean;
  /** Called with the chosen status ("Simpan sebagai Draf" / "Simpan & Terbitkan"). */
  onSave: (status: "draft" | "published") => void;
  cancelHref: string;
}

export function SaveButtons({ pending, onSave, cancelHref }: SaveButtonsProps) {
  return (
    <div className="flex flex-wrap gap-2 border-t pt-4">
      <Button type="button" variant="outline" className="min-h-11" disabled={pending} onClick={() => onSave("draft")}>
        Simpan sebagai Draf
      </Button>
      <Button type="button" className="min-h-11" disabled={pending} onClick={() => onSave("published")}>
        {pending ? "Menyimpan…" : "Simpan & Terbitkan"}
      </Button>
      <Button asChild variant="ghost" className="min-h-11">
        <Link href={cancelHref}>Batal</Link>
      </Button>
    </div>
  );
}
