import type { UseFormRegisterReturn } from "react-hook-form";

// Honeypot (design D17): deliberately NOT sr-only (screen readers would still reach it).
// Hidden from assistive tech with aria-hidden, moved off-screen, and removed from tab order.
// `id` keeps element ids unique when two forms share a page (/kontak).
export function Honeypot({ registration, id = "website" }: { registration: UseFormRegisterReturn; id?: string }) {
  return (
    <div aria-hidden="true" style={{ position: "absolute", left: "-10000px" }}>
      <label htmlFor={id}>Jangan isi kolom ini</label>
      <input id={id} type="text" tabIndex={-1} autoComplete="off" {...registration} />
    </div>
  );
}
