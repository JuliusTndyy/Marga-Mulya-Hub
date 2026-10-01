import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type HeroProps =
  | { fallback: true }
  | {
      fallback?: false;
      /** hero_title, falling back to village_name (design D6). */
      title: string;
      /** village_name shown above the title when hero_title is set. */
      eyebrow?: string | null;
      description?: string | null;
      imageUrl?: string | null;
    };

// Line pattern for the image-less hero (pure CSS, no assets; design D12).
const PATTERN_STYLE = {
  backgroundImage:
    "repeating-linear-gradient(135deg, rgba(255,255,255,0.06) 0 2px, transparent 2px 22px), repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0 2px, transparent 2px 30px)",
} as const;

export function Hero(props: HeroProps) {
  const title = props.fallback ? "Marga Mulya Hub" : props.title;
  const description = props.fallback ? "Selamat datang di portal informasi desa." : props.description;
  const eyebrow = props.fallback ? null : props.eyebrow;
  const imageUrl = props.fallback ? null : props.imageUrl;

  return (
    <section className="relative isolate overflow-hidden bg-primary text-primary-foreground" aria-labelledby="hero-title">
      {imageUrl ? (
        <>
          <Image src={imageUrl} alt="" fill priority sizes="100vw" className="-z-20 object-cover" />
          <div className="absolute inset-0 -z-10 bg-primary/70" aria-hidden="true" />
        </>
      ) : (
        <div className="absolute inset-0 -z-10" style={PATTERN_STYLE} aria-hidden="true" />
      )}
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28">
        <div className="max-w-2xl">
          {eyebrow ? <p className="mb-3 font-heading text-lg font-semibold text-secondary">{eyebrow}</p> : null}
          <h1 id="hero-title" className="font-heading text-4xl leading-tight font-extrabold break-words md:text-5xl">
            {title}
          </h1>
          {description ? <p className="mt-4 text-lg whitespace-pre-line text-white/90">{description}</p> : null}
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="min-h-11 bg-accent text-accent-foreground hover:bg-accent/90">
              <Link href="/profil">
                Jelajahi Desa
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="min-h-11 border-white bg-transparent text-white hover:bg-white/10 hover:text-white"
            >
              <Link href="/potensi">Lihat Potensi</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
