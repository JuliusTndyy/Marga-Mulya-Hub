// First focusable element on every public page (design D13).
export function SkipLink() {
  return (
    <a
      href="#konten"
      className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:rounded-md focus:bg-card focus:px-4 focus:py-3 focus:font-medium focus:shadow-md"
    >
      Lewati ke konten utama
    </a>
  );
}
