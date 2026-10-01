"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { approveSubmission, rejectSubmission } from "@/actions/submissions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { SubmissionStatus } from "@/types/db";
import { FormField } from "./form-field";

interface SubmissionActionsProps {
  id: string;
  status: SubmissionStatus;
  notes: string | null;
}

// Moderation controls (design D17, simplified by S3): notes + Setujui / Tolak. A decided submission can
// be re-decided to the other state. Nothing is published from here.
export function SubmissionActions({ id, status, notes }: SubmissionActionsProps) {
  const router = useRouter();
  const [value, setValue] = useState(notes ?? "");
  const [error, setError] = useState<string | undefined>(undefined);
  const [pending, startTransition] = useTransition();

  const run = (decision: "approve" | "reject") =>
    startTransition(async () => {
      setError(undefined);
      try {
        const action = decision === "approve" ? approveSubmission : rejectSubmission;
        const res = await action(id, value);
        if (res.ok) {
          toast.success(res.message);
          router.refresh();
        } else {
          setError(res.fieldErrors?.admin_notes?.[0]);
          toast.error(res.message);
        }
      } catch {
        toast.error("Terjadi kesalahan. Silakan coba lagi.");
      }
    });

  return (
    <section aria-labelledby="moderasi-judul" className="grid gap-3 border-t pt-4">
      <h2 id="moderasi-judul" className="font-heading text-lg font-semibold">
        Moderasi
      </h2>
      <FormField
        id="admin_notes"
        label="Catatan admin"
        description="Opsional, maksimal 1000 karakter. Hanya terlihat oleh admin."
        error={error}
      >
        {(p) => (
          <Textarea {...p} rows={3} maxLength={1000} value={value} onChange={(e) => setValue(e.target.value)} disabled={pending} />
        )}
      </FormField>
      <div className="flex flex-wrap gap-2">
        {status !== "approved" ? (
          <Button type="button" className="min-h-11" disabled={pending} aria-busy={pending || undefined} onClick={() => run("approve")}>
            Setujui
          </Button>
        ) : null}
        {status !== "rejected" ? (
          <Button
            type="button"
            variant="outline"
            className="min-h-11"
            disabled={pending}
            aria-busy={pending || undefined}
            onClick={() => run("reject")}
          >
            Tolak
          </Button>
        ) : null}
      </div>
    </section>
  );
}
