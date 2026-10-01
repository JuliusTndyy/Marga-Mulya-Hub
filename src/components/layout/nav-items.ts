// Public navigation (design D14). Route names are generic UI labels, not village facts.
export const NAV_ITEMS = [
  { href: "/", label: "Beranda" },
  { href: "/profil", label: "Profil" },
  { href: "/data-desa", label: "Data Desa" },
  { href: "/potensi", label: "Potensi" },
  { href: "/informasi", label: "Informasi" },
  { href: "/galeri", label: "Galeri" },
  { href: "/kontak", label: "Kontak" },
] as const;

export function isNavActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}
