import { describe, expect, it } from "vitest";
import {
  ANNOUNCEMENT_STATE_LABELS, formatTanggal, formatTanggalWaktu, getAnnouncementState,
  isAnnouncementActive, todayInSiteTz,
} from "@/lib/dates";

describe("todayInSiteTz", () => {
  it("uses WIB around UTC midnight", () => {
    expect(todayInSiteTz(new Date("2025-01-01T17:30:00Z"))).toBe("2025-01-02");
    expect(todayInSiteTz(new Date("2025-01-01T16:59:00Z"))).toBe("2025-01-01");
  });
});

describe("formatTanggal", () => {
  it("formats date-only strings without a zone shift", () => {
    expect(formatTanggal("2025-06-14")).toBe("14 Juni 2025");
  });
  it("formats timestamps in WIB", () => {
    expect(formatTanggal("2025-01-01T17:30:00Z")).toBe("2 Januari 2025");
  });
});

describe("formatTanggalWaktu", () => {
  it("formats dd MMM yyyy HH:mm in WIB", () => {
    expect(formatTanggalWaktu("2025-01-01T17:30:00Z")).toMatch(/^02 Jan 2025 00:30$/);
  });
});

describe("getAnnouncementState", () => {
  const today = "2025-06-14";
  it("is active without dates", () => {
    expect(getAnnouncementState({ start_date: null, end_date: null }, today)).toBe("active");
  });
  it("is scheduled when the start is in the future", () => {
    expect(getAnnouncementState({ start_date: "2025-06-15", end_date: null }, today)).toBe("scheduled");
  });
  it("is expired when the end was yesterday", () => {
    expect(getAnnouncementState({ start_date: null, end_date: "2025-06-13" }, today)).toBe("expired");
  });
  it("treats the end date as inclusive", () => {
    expect(getAnnouncementState({ start_date: "2025-06-01", end_date: today }, today)).toBe("active");
  });
  it("has Indonesian labels", () => {
    expect(ANNOUNCEMENT_STATE_LABELS.expired).toBe("Berakhir");
  });
});

describe("isAnnouncementActive", () => {
  const base = { type: "announcement", status: "published", start_date: null, end_date: null };
  it("requires a published announcement", () => {
    expect(isAnnouncementActive(base, "2025-06-14")).toBe(true);
    expect(isAnnouncementActive({ ...base, status: "draft" }, "2025-06-14")).toBe(false);
    expect(isAnnouncementActive({ ...base, type: "news" }, "2025-06-14")).toBe(false);
  });
});
