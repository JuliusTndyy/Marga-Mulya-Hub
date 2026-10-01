/** WhatsApp click-to-chat link: https://wa.me/{digits}?text={encoded}. */
export function waLink(number: string, text?: string): string {
  const digits = number.replace(/\D/g, "");
  const base = `https://wa.me/${digits}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

/** tel: link keeping only "+" and digits. */
export function telLink(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

/** Google Maps directions to a coordinate pair. */
export function directionsLink(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}
