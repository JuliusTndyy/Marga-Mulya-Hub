import { describe, expect, it } from "vitest";
import { contactSchema, contributionTextSchema } from "./public-forms";

const validContact = { name: "Warga", contact: "warga@example.com", subject: "Pertanyaan", message: "Pesan uji yang cukup panjang." };

function firstError(res: { success: boolean; error?: { issues: { path: PropertyKey[]; message: string }[] } }, field: string) {
  return res.error?.issues.find((i) => i.path[0] === field)?.message;
}

describe("contactSchema", () => {
  it("accepts valid input and trims", () => {
    const res = contactSchema.safeParse({ ...validContact, name: "  Warga  " });
    expect(res.success).toBe(true);
    expect(res.data?.name).toBe("Warga");
  });

  it("uses the custom messages for missing keys", () => {
    const res = contactSchema.safeParse({});
    expect(res.success).toBe(false);
    expect(firstError(res, "name")).toBe("Nama wajib diisi (2–100 karakter).");
    expect(firstError(res, "contact")).toBe("Kontak wajib diisi (email atau nomor telepon).");
    expect(firstError(res, "subject")).toBe("Subjek wajib diisi (3–150 karakter).");
    expect(firstError(res, "message")).toBe("Pesan wajib diisi (10–2000 karakter).");
  });

  it("enforces length limits", () => {
    expect(contactSchema.safeParse({ ...validContact, name: "A" }).success).toBe(false);
    expect(contactSchema.safeParse({ ...validContact, name: "A".repeat(101) }).success).toBe(false);
    expect(contactSchema.safeParse({ ...validContact, contact: "1234" }).success).toBe(false);
    expect(contactSchema.safeParse({ ...validContact, message: "pendek" }).success).toBe(false);
    expect(contactSchema.safeParse({ ...validContact, message: "x".repeat(2000) }).success).toBe(true);
    expect(contactSchema.safeParse({ ...validContact, message: "x".repeat(2001) }).success).toBe(false);
  });

  it("strips control characters", () => {
    const res = contactSchema.safeParse({ ...validContact, subject: "Per\u0000tanyaan" });
    expect(res.data?.subject).toBe("Pertanyaan");
  });

  it("ignores the honeypot and timestamp keys", () => {
    const res = contactSchema.safeParse({ ...validContact, website: "x", started_at: "1" });
    expect(res.success).toBe(true);
    expect(res.data).not.toHaveProperty("website");
  });
});

const validSubmission = {
  submitter_name: "Warga",
  category: "Lingkungan",
  title: "Judul kiriman",
  description: "Deskripsi kiriman yang cukup panjang.",
};

describe("contributionTextSchema", () => {
  it("accepts valid input; missing optional fields become null", () => {
    const res = contributionTextSchema.safeParse(validSubmission);
    expect(res.success).toBe(true);
    expect(res.data).toMatchObject({ contact: null, location: null, latitude: null, longitude: null });
  });

  it("rejects an unknown category with 'Pilih kategori.'", () => {
    const res = contributionTextSchema.safeParse({ ...validSubmission, category: "Lainnya" });
    expect(firstError(res, "category")).toBe("Pilih kategori.");
  });

  it("enforces the D17 limits", () => {
    expect(firstError(contributionTextSchema.safeParse({ ...validSubmission, title: "abc" }), "title")).toBe(
      "Judul wajib diisi (5–150 karakter).",
    );
    expect(firstError(contributionTextSchema.safeParse({ ...validSubmission, description: "pendek" }), "description")).toBe(
      "Deskripsi wajib diisi (20–3000 karakter).",
    );
    expect(firstError(contributionTextSchema.safeParse({ ...validSubmission, contact: "x".repeat(101) }), "contact")).toBe(
      "Kontak maksimal 100 karakter.",
    );
    expect(firstError(contributionTextSchema.safeParse({ ...validSubmission, location: "x".repeat(201) }), "location")).toBe(
      "Lokasi maksimal 200 karakter.",
    );
  });

  it("requires latitude and longitude together", () => {
    const res = contributionTextSchema.safeParse({ ...validSubmission, latitude: "-6.2" });
    expect(firstError(res, "latitude")).toBe("Isi lintang dan bujur bersamaan.");
    const ok = contributionTextSchema.safeParse({ ...validSubmission, latitude: "-6.2", longitude: "106.8" });
    expect(ok.data).toMatchObject({ latitude: -6.2, longitude: 106.8 });
  });

  it("rejects out-of-range coordinates", () => {
    expect(contributionTextSchema.safeParse({ ...validSubmission, latitude: "91", longitude: "0" }).success).toBe(false);
  });
});
