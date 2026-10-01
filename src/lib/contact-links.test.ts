import { describe, expect, it } from "vitest";
import { directionsLink, telLink, waLink } from "@/lib/contact-links";

describe("contact links", () => {
  it("builds WhatsApp links", () => {
    expect(waLink("62 812-3456")).toBe("https://wa.me/628123456");
    expect(waLink("628123456", "Halo, apa kabar?")).toBe("https://wa.me/628123456?text=Halo%2C%20apa%20kabar%3F");
  });
  it("builds tel links keeping + and digits", () => {
    expect(telLink("+62 (21) 555-01")).toBe("tel:+622155501");
  });
  it("builds directions links", () => {
    expect(directionsLink(-6.2, 106.8)).toBe("https://www.google.com/maps/dir/?api=1&destination=-6.2,106.8");
  });
});
