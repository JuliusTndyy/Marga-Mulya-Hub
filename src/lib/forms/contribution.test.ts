import { afterEach, describe, expect, it, vi } from "vitest";
import { CONTRIBUTION_SUCCESS, handleContribution, type ContributionDeps } from "./contribution";

const NOW = 1_700_000_000_000;

function fakeClient(result: { error: { code: string } | null } | "throw" = { error: null }) {
  const inserts: { table: string; row: unknown }[] = [];
  const client = {
    from(table: string) {
      return {
        insert(row: unknown) {
          inserts.push({ table, row });
          return result === "throw" ? Promise.reject(new Error("network")) : Promise.resolve(result);
        },
      };
    },
  } as unknown as NonNullable<ContributionDeps["publicClient"]>;
  return { client, inserts };
}

function form(values: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(values)) fd.append(k, v);
  return fd;
}

const valid = {
  submitter_name: "Warga",
  category: "Lingkungan",
  title: "Judul kiriman",
  description: "Deskripsi kiriman yang cukup panjang.",
  started_at: String(NOW - 10_000),
};

afterEach(() => vi.restoreAllMocks());

describe("handleContribution (text only, S4)", () => {
  it("honeypot filled → success result, no insert", async () => {
    vi.spyOn(console, "info").mockImplementation(() => {});
    const { client, inserts } = fakeClient();
    const res = await handleContribution(form({ ...valid, website: "x" }), { publicClient: client, now: NOW });
    expect(res).toEqual({ ok: true, message: CONTRIBUTION_SUCCESS });
    expect(inserts).toHaveLength(0);
  });

  it("submitted too fast → success result, no insert", async () => {
    vi.spyOn(console, "info").mockImplementation(() => {});
    const { client, inserts } = fakeClient();
    const res = await handleContribution(form({ ...valid, started_at: String(NOW - 1000) }), { publicClient: client, now: NOW });
    expect(res).toEqual({ ok: true, message: CONTRIBUTION_SUCCESS });
    expect(inserts).toHaveLength(0);
  });

  it("null client → 'Layanan formulir belum tersedia.'", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const res = await handleContribution(form(valid), { publicClient: null, now: NOW });
    expect(res).toEqual({ ok: false, message: "Layanan formulir belum tersedia." });
  });

  it("invalid fields → field errors, no insert", async () => {
    const { client, inserts } = fakeClient();
    const res = await handleContribution(form({ ...valid, category: "Bukan kategori" }), { publicClient: client, now: NOW });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.fieldErrors?.category?.[0]).toBe("Pilih kategori.");
    expect(inserts).toHaveLength(0);
  });

  it("valid → exactly one insert into citizen_submissions without status or admin fields", async () => {
    const { client, inserts } = fakeClient();
    const res = await handleContribution(form({ ...valid, latitude: "-6.2", longitude: "106.8" }), { publicClient: client, now: NOW });
    expect(res).toEqual({ ok: true, message: CONTRIBUTION_SUCCESS });
    expect(inserts).toHaveLength(1);
    expect(inserts[0]!.table).toBe("citizen_submissions");
    expect(inserts[0]!.row).toEqual({
      submitter_name: "Warga",
      contact: null,
      category: "Lingkungan",
      title: "Judul kiriman",
      description: "Deskripsi kiriman yang cukup panjang.",
      location: null,
      latitude: -6.2,
      longitude: 106.8,
      image_url: null,
    });
    for (const key of ["status", "admin_notes", "reviewed_at", "converted_id", "converted_type", "started_at", "website"]) {
      expect(inserts[0]!.row).not.toHaveProperty(key);
    }
  });

  it("ignores a photo entry (no upload in the simplified form)", async () => {
    const { client, inserts } = fakeClient();
    const fd = form(valid);
    fd.append("photo", new File([new Uint8Array([0xff, 0xd8, 0xff])], "a.jpg", { type: "image/jpeg" }));
    const res = await handleContribution(fd, { publicClient: client, now: NOW });
    expect(res.ok).toBe(true);
    expect(inserts[0]!.row).toMatchObject({ image_url: null });
  });

  it("insert error → 'Gagal mengirim. Silakan coba lagi.'", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { client } = fakeClient({ error: { code: "42501" } });
    const res = await handleContribution(form(valid), { publicClient: client, now: NOW });
    expect(res).toEqual({ ok: false, message: "Gagal mengirim. Silakan coba lagi." });
  });

  it("insert throws → 'Gagal mengirim. Silakan coba lagi.'", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { client } = fakeClient("throw");
    const res = await handleContribution(form(valid), { publicClient: client, now: NOW });
    expect(res).toEqual({ ok: false, message: "Gagal mengirim. Silakan coba lagi." });
  });
});
