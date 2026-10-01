"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { UPLOAD_LIMITS } from "@/lib/config";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export type MediaModule = "settings" | "profile" | "officials" | "potentials" | "posts" | "gallery";

interface ImageUploadFieldProps {
  id: string;
  label: string;
  module: MediaModule;
  value: string | null | undefined;
  onChange: (url: string | null) => void;
  error?: string;
  required?: boolean;
  description?: string;
}

const EXT: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
const TYPE_ERROR = "Gambar harus JPG, PNG, atau WEBP dan maksimal 5 MB.";

// Admin upload flow (design D10): client check → preview → upload to media/{module}/{uuid}.{ext}
// with the browser client (session cookie; RLS checks is_admin()) → value = public URL.
// The old object is removed by the server action when the record is saved.
export function ImageUploadField({ id, label, module, value, onChange, error, required, description }: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const enabled = isSupabaseConfigured();

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  const shown = preview ?? value ?? null;
  const errorText = localError ?? error;
  const descId = `${id}-desc`;
  const errorId = errorText ? `${id}-error` : undefined;

  async function onFile(file: File | undefined) {
    setLocalError(null);
    if (!file) return;
    const allowed = (UPLOAD_LIMITS.mimeTypes as readonly string[]).includes(file.type);
    if (!allowed || file.size < 1 || file.size > UPLOAD_LIMITS.mediaBytes) {
      setLocalError(TYPE_ERROR);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    const sb = createSupabaseBrowserClient();
    if (!sb) {
      setLocalError("Unggah gambar belum tersedia.");
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setUploading(true);
    try {
      const path = `${module}/${crypto.randomUUID()}.${EXT[file.type]}`;
      const { error: upErr } = await sb.storage.from("media").upload(path, file, { contentType: file.type, upsert: false });
      if (upErr) throw upErr;
      onChange(sb.storage.from("media").getPublicUrl(path).data.publicUrl);
    } catch (e) {
      console.error("[upload] media upload failed", e);
      toast.error("Gagal mengunggah gambar");
      setPreview(null); // keep the previous value
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="grid gap-2">
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
        {required ? <span className="font-normal text-muted-foreground">(wajib)</span> : null}
      </Label>
      {shown ? (
        // eslint-disable-next-line @next/next/no-img-element -- admin preview of blob/remote URLs
        <img src={shown} alt={`Pratinjau ${label.toLowerCase()}`} className="max-h-48 w-auto max-w-full rounded-lg border object-contain" />
      ) : (
        <p className="text-sm text-muted-foreground">Belum ada gambar.</p>
      )}
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        disabled={!enabled || uploading}
        aria-describedby={[descId, errorId].filter(Boolean).join(" ")}
        aria-invalid={errorText ? true : undefined}
        onChange={(e) => void onFile(e.target.files?.[0])}
      />
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          className="min-h-11"
          disabled={!enabled || uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? "Mengunggah…" : shown ? "Ganti gambar" : "Pilih gambar"}
        </Button>
        {value ? (
          <Button
            type="button"
            variant="ghost"
            className="min-h-11"
            disabled={uploading}
            onClick={() => {
              setPreview(null);
              onChange(null);
            }}
          >
            Hapus gambar
          </Button>
        ) : null}
      </div>
      <p id={descId} className="text-sm text-muted-foreground">
        {enabled ? description ?? "JPG, PNG, atau WEBP, maksimal 5 MB." : "Unggah gambar belum tersedia."}
      </p>
      {errorText ? (
        <p id={errorId} className="text-sm font-medium text-destructive">
          {errorText}
        </p>
      ) : null}
    </div>
  );
}
