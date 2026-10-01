// SQL / RLS test (design D25). Boots an in-memory PGlite, stubs the Supabase-specific objects,
// runs the migrations and the seed from disk (0002 and the seed twice, to prove they are
// re-runnable / idempotent) and asserts the core RLS, trigger and seed invariants.
// 0003_storage.sql is not run: the `storage` schema is Supabase-specific (README manual checklist).
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { getAnnouncementState } from "@/lib/dates";

const sqlFile = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), "utf8");

const PRELUDE = `
  create schema auth;
  create table auth.users (id uuid primary key, email text);
  create function auth.uid() returns uuid language sql stable as
    $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  create role anon nologin; create role authenticated nologin;
  grant usage on schema auth to anon, authenticated;
  grant execute on function auth.uid() to anon, authenticated;
`;

const TABLES = [
  "admin_users", "site_settings", "village_profiles", "officials", "village_statistics",
  "information_posts", "potentials", "gallery_items", "contact_messages", "citizen_submissions",
] as const;

const ADMIN_ID = "00000000-0000-4000-8000-00000000a001";
const USER_ID = "00000000-0000-4000-8000-00000000b001";

let db: PGlite;
let countsAfterFirstSeed: Record<string, number>;
let countsAfterSecondSeed: Record<string, number>;

async function count(sql: string, params: unknown[] = []): Promise<number> {
  const r = await db.query<{ n: number }>(`select count(*)::int as n from (${sql}) as q`, params);
  return r.rows[0]?.n ?? -1;
}

async function tableCounts(): Promise<Record<string, number>> {
  const out: Record<string, number> = {};
  for (const t of TABLES) out[t] = await count(`select 1 from public.${t}`);
  return out;
}

/** Runs fn as a role and always resets the role, even when the statement throws. */
async function asRole<T>(role: "anon" | "authenticated", sub: string | null, fn: () => Promise<T>): Promise<T> {
  await db.exec(`set role ${role}`);
  await db.query("select set_config('request.jwt.claim.sub', $1, false)", [sub ?? ""]);
  try {
    return await fn();
  } finally {
    await db.exec("reset role");
    await db.query("select set_config('request.jwt.claim.sub', '', false)");
  }
}

/** Runs a statement; returns affected rows, or the SQLSTATE code when it throws. */
async function tryRun(sql: string, params: unknown[] = []): Promise<{ affected: number } | { code: string }> {
  try {
    const r = await db.query(sql, params);
    return { affected: r.affectedRows ?? 0 };
  } catch (e) {
    return { code: (e as { code?: string }).code ?? "unknown" };
  }
}

const validSubmission = `insert into public.citizen_submissions (submitter_name, category, title, description)
  values ('Warga Uji', 'Lingkungan', 'Judul uji coba', 'Deskripsi uji coba yang cukup panjang.')`;

beforeAll(async () => {
  db = await PGlite.create();
  await db.exec(PRELUDE);
  await db.exec(sqlFile("./migrations/0001_schema.sql"));
  await db.exec(sqlFile("./migrations/0002_rls.sql"));
  await db.exec(sqlFile("./migrations/0002_rls.sql")); // re-runnable (acceptance #25)
  await db.exec(sqlFile("./seed/0001_seed_placeholder.sql"));
  countsAfterFirstSeed = await tableCounts();
  await db.exec(sqlFile("./seed/0001_seed_placeholder.sql")); // idempotent
  countsAfterSecondSeed = await tableCounts();

  // Fixtures, inserted as the superuser (bypasses RLS).
  await db.exec(`
    insert into auth.users (id, email) values
      ('${ADMIN_ID}', 'admin@example.com'), ('${USER_ID}', 'warga@example.com');
    insert into public.admin_users (id, email) values ('${ADMIN_ID}', 'admin@example.com');
    insert into public.potentials (slug, name, category, status) values ('draf-uji', 'Draf Uji', 'Lainnya', 'draft');
    ${validSubmission};
  `);
}, 120_000);

afterAll(async () => {
  await db?.close();
});

describe("migrations and seed", () => {
  it("seed run twice leaves identical row counts", () => {
    expect(countsAfterSecondSeed).toEqual(countsAfterFirstSeed);
    expect(countsAfterFirstSeed).toMatchObject({
      site_settings: 1, village_profiles: 1, officials: 2, village_statistics: 11,
      information_posts: 5, potentials: 2, gallery_items: 0, contact_messages: 0, citizen_submissions: 0,
    });
  });
});

describe("RLS as anon", () => {
  it("cannot read any citizen_submissions row", async () => {
    const r = await asRole("anon", null, () => tryRun("select * from public.citizen_submissions"));
    if ("code" in r) expect(r.code).toBe("42501");
    else expect(r.affected).toBe(0);
  });

  it("cannot see drafts", async () => {
    const n = await asRole("anon", null, () => count("select 1 from public.potentials where status = 'draft'"));
    expect(n).toBe(0);
    const pub = await asRole("anon", null, () => count("select 1 from public.potentials"));
    expect(pub).toBe(2);
  });

  it("cannot insert content", async () => {
    await expect(
      asRole("anon", null, () =>
        db.query("insert into public.potentials (slug, name, category, status) values ('x-anon', 'Anon', 'Lainnya', 'published')")),
    ).rejects.toMatchObject({ code: "42501" });
  });

  it("cannot update content", async () => {
    const r = await asRole("anon", null, () => tryRun("update public.information_posts set title = 'Diubah anon'"));
    if ("code" in r) expect(r.code).toBe("42501");
    else expect(r.affected).toBe(0);
  });

  it("cannot insert an approved submission", async () => {
    await expect(
      asRole("anon", null, () =>
        db.query(`insert into public.citizen_submissions (submitter_name, category, title, description, status)
          values ('Warga Uji', 'Lingkungan', 'Judul uji coba', 'Deskripsi uji coba yang cukup panjang.', 'approved')`)),
    ).rejects.toMatchObject({ code: "42501" });
  });

  it("can insert a pending submission and an unread contact message", async () => {
    await asRole("anon", null, () => db.query(validSubmission));
    await asRole("anon", null, () =>
      db.query(`insert into public.contact_messages (name, contact, subject, message, status)
        values ('Warga Uji', 'warga@example.com', 'Subjek uji', 'Pesan uji coba singkat.', 'unread')`));
    expect(await count("select 1 from public.citizen_submissions where status = 'pending'")).toBe(2);
    expect(await count("select 1 from public.contact_messages")).toBe(1);
  });
});

describe("RLS as authenticated non-admin", () => {
  it("cannot update content", async () => {
    const r = await asRole("authenticated", USER_ID, () => tryRun("update public.potentials set name = 'x'"));
    expect(r).toEqual({ affected: 0 });
  });

  it("sees no admin_users rows", async () => {
    const n = await asRole("authenticated", USER_ID, () => count("select 1 from public.admin_users"));
    expect(n).toBe(0);
  });

  it("cannot read submissions or messages", async () => {
    expect(await asRole("authenticated", USER_ID, () => count("select 1 from public.citizen_submissions"))).toBe(0);
    expect(await asRole("authenticated", USER_ID, () => count("select 1 from public.contact_messages"))).toBe(0);
  });
});

describe("RLS as admin", () => {
  it("can update content and sees drafts", async () => {
    const r = await asRole("authenticated", ADMIN_ID, () =>
      tryRun("update public.potentials set name = 'Draf Uji Diubah' where slug = 'draf-uji'"));
    expect(r).toEqual({ affected: 1 });
    const drafts = await asRole("authenticated", ADMIN_ID, () =>
      count("select 1 from public.potentials where status = 'draft'"));
    expect(drafts).toBe(1);
  });

  it("can read submissions and its own admin row", async () => {
    expect(await asRole("authenticated", ADMIN_ID, () => count("select 1 from public.citizen_submissions"))).toBe(2);
    expect(await asRole("authenticated", ADMIN_ID, () => count("select 1 from public.admin_users"))).toBe(1);
  });
});

describe("announcement rule", () => {
  it("SQL effective window and getAnnouncementState agree on the seed", async () => {
    const active = await db.query<{ slug: string }>(
      `select slug from public.information_posts
        where type = 'announcement' and effective_start <= current_date and effective_end >= current_date
        order by slug`);
    expect(active.rows.map((r) => r.slug)).toEqual(["contoh-pengumuman"]);

    const all = await db.query<{ slug: string; start_date: string | null; end_date: string | null; today: string }>(
      `select slug, start_date::text as start_date, end_date::text as end_date, current_date::text as today
         from public.information_posts where type = 'announcement' order by slug`);
    const jsActive = all.rows
      .filter((r) => getAnnouncementState(r, r.today) === "active")
      .map((r) => r.slug);
    expect(jsActive).toEqual(["contoh-pengumuman"]);
    const expired = all.rows.find((r) => r.slug === "contoh-pengumuman-berakhir");
    expect(expired && getAnnouncementState(expired, expired.today)).toBe("expired");
  });
});

describe("generated columns", () => {
  it("default to -infinity / infinity", async () => {
    const r = await db.query<{ s: string; e: string }>(
      "select effective_start::text as s, effective_end::text as e from public.information_posts where slug = 'contoh-berita'");
    expect(r.rows[0]).toEqual({ s: "-infinity", e: "infinity" });
  });
});

describe("seed neutrality", () => {
  it("has exactly one highlighted statistic (Jumlah Penduduk / Total / 2024)", async () => {
    const r = await db.query<{ category: string; indicator: string; year: number }>(
      "select category, indicator, year from public.village_statistics where is_highlight");
    expect(r.rows).toEqual([{ category: "Jumlah Penduduk", indicator: "Total", year: 2024 }]);
  });

  it("features only the neutral Lainnya potential", async () => {
    expect(await count("select 1 from public.potentials where is_featured and category <> 'Lainnya'")).toBe(0);
  });

  it("marks every statistic as sample data", async () => {
    expect(await count("select 1 from public.village_statistics where not is_sample")).toBe(0);
  });

  it("leaves all coordinates empty", async () => {
    expect(await count("select 1 from public.site_settings where latitude is not null or longitude is not null")).toBe(0);
    expect(await count("select 1 from public.potentials where latitude is not null or longitude is not null")).toBe(0);
  });
});

describe("constraints and triggers", () => {
  it("rejects rich text over 60 000 characters", async () => {
    await expect(
      db.query(`insert into public.information_posts (slug, type, title, content)
        values ('terlalu-panjang', 'news', 'Terlalu panjang', repeat('a', 60001))`),
    ).rejects.toMatchObject({ code: "23514" });
  });

  it("sets published_at and sort_date on a published insert", async () => {
    await db.query(`insert into public.information_posts (slug, type, title, status)
      values ('uji-trigger', 'news', 'Uji trigger', 'published')`);
    const r = await db.query<{ has_pub: boolean; has_sort: boolean }>(
      `select published_at is not null as has_pub, sort_date is not null as has_sort
         from public.information_posts where slug = 'uji-trigger'`);
    expect(r.rows[0]).toEqual({ has_pub: true, has_sort: true });
  });

  it("uses event_date as sort_date for events", async () => {
    const r = await db.query<{ ok: boolean }>(
      "select sort_date = event_date as ok from public.information_posts where slug = 'contoh-agenda'");
    expect(r.rows[0]?.ok).toBe(true);
  });
});
