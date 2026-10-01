"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import type { ActionResult } from "@/lib/result";

interface DeleteDialogProps {
  title: string;
  /** A bound server action, e.g. deletePotential.bind(null, id). */
  action: () => Promise<ActionResult<unknown>>;
  /** Navigate here after deletion (detail pages); lists just refresh. */
  redirectTo?: string;
  triggerLabel?: string;
}

export function DeleteDialog({ title, action, redirectTo, triggerLabel = "Hapus" }: DeleteDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const onConfirm = () =>
    startTransition(async () => {
      try {
        const res = await action();
        if (res.ok) {
          toast.success(res.message);
          setOpen(false);
          if (redirectTo) router.push(redirectTo);
          else router.refresh();
        } else {
          toast.error(res.message);
        }
      } catch {
        toast.error("Terjadi kesalahan. Silakan coba lagi.");
      }
    });

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button type="button" variant="destructive" className="min-h-11">
          {triggerLabel}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus data</AlertDialogTitle>
          <AlertDialogDescription>
            Hapus “{title}”? Tindakan ini tidak dapat dibatalkan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="min-h-11" disabled={pending}>
            Batal
          </AlertDialogCancel>
          {/* A plain Button keeps the dialog open until the action finishes. */}
          <Button type="button" variant="destructive" className="min-h-11" onClick={onConfirm} disabled={pending}>
            {pending ? "Menghapus…" : "Hapus"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
