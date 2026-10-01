import { describe, expect, it } from "vitest";
import { toFormData } from "./to-form-data";

describe("toFormData", () => {
  it("skips empty strings, null and undefined", () => {
    const fd = toFormData({ name: "Budi", contact: "", subject: null, message: undefined, started_at: "123" });
    expect([...fd.keys()].sort()).toEqual(["name", "started_at"]);
    expect(fd.get("name")).toBe("Budi");
  });

  it("stringifies numbers", () => {
    const fd = toFormData({ latitude: -6.5 });
    expect(fd.get("latitude")).toBe("-6.5");
  });

  it("never copies a photo value from the values object", () => {
    const fd = toFormData({ name: "A", photo: "something" });
    expect(fd.has("photo")).toBe(false);
  });

  it("appends photo only when a File is passed", () => {
    expect(toFormData({ name: "A" }, null).has("photo")).toBe(false);
    expect(toFormData({ name: "A" }).has("photo")).toBe(false);
    const file = new File([new Uint8Array([1, 2, 3])], "a.png", { type: "image/png" });
    const fd = toFormData({ name: "A" }, file);
    expect(fd.get("photo")).toBeInstanceOf(File);
  });
});
