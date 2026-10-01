import { afterEach, describe, expect, it, vi } from "vitest";
import { CONTACT_SUCCESS, handleContactMessage, type ContactDeps } from "./contact";

const NOW = 1_700_000_000_000;

function fakeClient(result: { error: { code: string } | null } = { error: null }) {
  const inserts: { table: string; row: unknown }[] = [];
  const client = {
    from(table: string) {
      return {
        insert(row: unknown) {
          inserts.push({ table, row });
          return Promise.resolve(result);
        },
      };
    },
  } as unknown as NonNullable<ContactDeps["publicClient"]>;
  return { client, inserts };
}

function form(values: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(values)) fd.append(k, v);
  return fd;
}

const valid = {
  name: "Warga",
  contact: "warga@example.com",
  subject: "Pertanyaan",
  message: "Pesan uji yang cukup panjang.",
  started_at: String(NOW - 10_000),
};

afterEach(() => vi.restoreAllMocks());

describe("handleContactMessage", () => {
  it("honeypot filled → success result, no insert", async () => {
    vi.spyOn(console, "info").mockImplementation(() => {});
    const { client, inserts } = fakeClient();
    const res = await handleContactMessage(form({ ...valid, website: "x" }), { publicClient: client, now: NOW });
    expect(res).toEqual({ ok: true, message: CONTACT_SUCCESS });
    expect(inserts).toHaveLength(0);
  });

  it("submitted too fast → success result, no insert", async () => {
    vi.spyOn(console, "info").mockImplementation(() => {});
    const { client, inserts } = fakeClient();
    const res = await handleContactMessage(form({ ...valid, started_at: String(NOW - 1000) }), { publicClient: client, now: NOW });
    expect(res.ok).toBe(true);
    expect(inserts).toHaveLength(0);
  });

  it("missing started_at → treated as spam, no insert", async () => {
    vi.spyOn(console, "info").mockImplementation(() => {});
    const { client, inserts } = fakeClient();
    const { started_at: _omit, ...rest } = valid;
    void _omit;
    const res = await handleContactMessage(form(rest), { publicClient: client, now: NOW });
    expect(res.ok).toBe(true);
    expect(inserts).toHaveLength(0);
  });

  it("null client → 'Layanan formulir belum tersedia.'", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const res = await handleContactMessage(form(valid), { publicClient: null, now: NOW });
    expect(res).toEqual({ ok: false, message: "Layanan formulir belum tersedia." });
  });

  it("invalid fields → field errors, no insert", async () => {
    const { client, inserts } = fakeClient();
    const res = await handleContactMessage(form({ ...valid, name: "A" }), { publicClient: client, now: NOW });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.fieldErrors?.name?.[0]).toBe("Nama wajib diisi (2–100 karakter).");
    expect(inserts).toHaveLength(0);
  });

  it("valid → exactly one insert into contact_messages with status omitted", async () => {
    const { client, inserts } = fakeClient();
    const res = await handleContactMessage(form(valid), { publicClient: client, now: NOW });
    expect(res).toEqual({ ok: true, message: CONTACT_SUCCESS });
    expect(inserts).toHaveLength(1);
    expect(inserts[0]!.table).toBe("contact_messages");
    expect(inserts[0]!.row).toEqual({
      name: "Warga",
      contact: "warga@example.com",
      subject: "Pertanyaan",
      message: "Pesan uji yang cukup panjang.",
    });
    expect(inserts[0]!.row).not.toHaveProperty("status");
    expect(inserts[0]!.row).not.toHaveProperty("started_at");
  });

  it("insert error → 'Gagal mengirim. Silakan coba lagi.'", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { client } = fakeClient({ error: { code: "42501" } });
    const res = await handleContactMessage(form(valid), { publicClient: client, now: NOW });
    expect(res).toEqual({ ok: false, message: "Gagal mengirim. Silakan coba lagi." });
  });
});
