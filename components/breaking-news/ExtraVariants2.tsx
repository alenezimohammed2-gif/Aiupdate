"use client";

import { useState, useEffect, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ProcessedArticle } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { ar, enUS } from "date-fns/locale";

interface Props {
  articles: ProcessedArticle[];
}

function useH() {
  const locale = useLocale();
  const t = useTranslations();
  const isArabic = locale === "ar";
  const gt = (a: ProcessedArticle) => isArabic ? a.title_ar : a.title_en;
  const gs = (a: ProcessedArticle) => isArabic ? a.summary_ar : a.summary_en;
  const gc = (a: ProcessedArticle) => t(`categories.${a.category}`);
  const gm = (a: ProcessedArticle) => formatDistanceToNow(new Date(a.processed_at), { addSuffix: true, locale: isArabic ? ar : enUS });
  return { locale, isArabic, gt, gs, gc, gm };
}

/* ===== WINDOWS TILES ===== */
export function WindowsTiles({ articles }: Props) {
  const { locale, gt, gc } = useH();
  const items = articles.slice(0, 6);
  const sizes = ["col-span-2 row-span-2", "col-span-1 row-span-1", "col-span-1 row-span-1", "col-span-1 row-span-2", "col-span-2 row-span-1", "col-span-1 row-span-1"];
  const colors = ["from-blue-600/80", "from-green-600/80", "from-purple-600/80", "from-red-600/80", "from-amber-600/80", "from-cyan-600/80"];
  return (
    <div className="grid grid-cols-4 auto-rows-[120px] gap-1.5 rounded-xl overflow-hidden">
      {items.map((a, i) => (
        <a key={a.id} href={`/${locale}/article/${a.id}`}
          className={`${sizes[i]} relative overflow-hidden group hover:brightness-110 transition-all`}>
          {a.image_url && <img src={a.image_url} alt="" className="absolute inset-0 w-full h-full object-cover" />}
          <div className={`absolute inset-0 bg-gradient-to-br ${colors[i]} to-transparent opacity-70`} />
          <div className="absolute bottom-0 p-3 z-10">
            <span className="text-[9px] text-white/80 font-medium uppercase">{gc(a)}</span>
            <h4 className={`font-bold text-white mt-0.5 leading-tight ${i === 0 ? "text-base" : "text-xs line-clamp-2"}`}>{gt(a)}</h4>
          </div>
        </a>
      ))}
    </div>
  );
}

/* ===== CARD DECK (Tinder-style) ===== */
export function CardDeck({ articles }: Props) {
  const [index, setIndex] = useState(0);
  const { locale, gt, gs, gc, gm } = useH();
  const items = articles.slice(0, 5);
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-[400px]" style={{ height: "380px" }}>
        {items.map((a, i) => {
          const pos = (i - index + items.length) % items.length;
          if (pos > 2) return null;
          return (
            <div key={a.id}
              className="absolute inset-0 rounded-2xl overflow-hidden border border-border/30 bg-card transition-all duration-500"
              style={{ transform: `translateY(${pos * 12}px) translateX(${pos * 5}px) scale(${1 - pos * 0.04}) rotate(${pos * 2}deg)`, zIndex: 10 - pos, opacity: 1 - pos * 0.2 }}>
              <a href={pos === 0 ? `/${locale}/article/${a.id}` : undefined} className="block h-full group">
                {a.image_url && <img src={a.image_url} alt="" className="w-full h-3/5 object-cover" />}
                <div className="p-4">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">{gc(a)}</span>
                  <h3 className="font-bold text-sm mt-2 group-hover:text-primary transition-colors">{gt(a)}</h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{gs(a)}</p>
                </div>
              </a>
            </div>
          );
        })}
      </div>
      <div className="flex gap-3">
        <button onClick={() => setIndex((i) => (i - 1 + items.length) % items.length)}
          className="px-4 py-2 rounded-full border border-border/50 text-sm hover:bg-card transition-colors">←</button>
        <button onClick={() => setIndex((i) => (i + 1) % items.length)}
          className="px-4 py-2 rounded-full border border-border/50 text-sm hover:bg-card transition-colors">→</button>
      </div>
    </div>
  );
}

/* ===== SCROLL REVEAL ===== */
export function ScrollReveal({ articles }: Props) {
  const { locale, gt, gs, gc, gm } = useH();
  return (
    <div className="space-y-6">
      {articles.slice(0, 5).map((a, i) => (
        <a key={a.id} href={`/${locale}/article/${a.id}`}
          className="flex items-center gap-6 p-4 rounded-2xl border border-border/30 bg-card hover:border-primary/30 transition-all group animate-fade-in"
          style={{ animationDelay: `${i * 0.1}s` }}>
          <span className="text-5xl font-black text-primary/20 flex-shrink-0 w-16 text-center">{String(i + 1).padStart(2, "0")}</span>
          {a.image_url && <img src={a.image_url} alt="" className="w-32 h-20 object-cover rounded-xl flex-shrink-0" />}
          <div className="flex-1 min-w-0">
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">{gc(a)}</span>
            <h3 className="font-bold text-base mt-1 group-hover:text-primary transition-colors">{gt(a)}</h3>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{gs(a)}</p>
          </div>
          <span className="text-[10px] text-muted-foreground flex-shrink-0">{gm(a)}</span>
        </a>
      ))}
    </div>
  );
}

/* ===== NEON GLOW ===== */
export function NeonGlow({ articles }: Props) {
  const { locale, gt, gc, gm } = useH();
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {articles.slice(0, 3).map((a, i) => {
        const glows = ["shadow-[0_0_30px_rgba(99,102,241,0.3)]", "shadow-[0_0_30px_rgba(236,72,153,0.3)]", "shadow-[0_0_30px_rgba(34,211,238,0.3)]"];
        const borders = ["border-indigo-500/50", "border-pink-500/50", "border-cyan-500/50"];
        return (
          <a key={a.id} href={`/${locale}/article/${a.id}`}
            className={`rounded-2xl overflow-hidden border ${borders[i]} bg-card group hover:${glows[i]} transition-all duration-500`}
            style={{ boxShadow: `0 0 0 rgba(0,0,0,0)` }}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = i === 0 ? "0 0 30px rgba(99,102,241,0.4)" : i === 1 ? "0 0 30px rgba(236,72,153,0.4)" : "0 0 30px rgba(34,211,238,0.4)"}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = "0 0 0 rgba(0,0,0,0)"}>
            {a.image_url && <img src={a.image_url} alt="" className="w-full aspect-video object-cover group-hover:brightness-110 transition-all" />}
            <div className="p-4">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">{gc(a)}</span>
              <h3 className="font-bold text-sm mt-2 group-hover:text-primary transition-colors">{gt(a)}</h3>
              <span className="text-[10px] text-muted-foreground mt-2 block">{a.source} • {gm(a)}</span>
            </div>
          </a>
        );
      })}
    </div>
  );
}

/* ===== BOOK PAGES ===== */
export function BookPages({ articles }: Props) {
  const [page, setPage] = useState(0);
  const { locale, gt, gs, gc, gm } = useH();
  const items = articles.slice(0, 4);
  const a = items[page];
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full max-w-3xl rounded-2xl overflow-hidden border border-border/30 bg-card" style={{ minHeight: "350px" }}>
        <div className="grid grid-cols-2 h-full" style={{ minHeight: "350px" }}>
          <div className="border-r border-border/20 p-6 flex flex-col justify-center bg-gradient-to-br from-card to-background">
            {a.image_url && <img src={a.image_url} alt="" className="w-full aspect-video object-cover rounded-xl mb-4" />}
            <span className="text-[10px] text-muted-foreground">{a.source}</span>
          </div>
          <div className="p-6 flex flex-col justify-center">
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-primary/10 text-primary w-fit">{gc(a)}</span>
            <a href={`/${locale}/article/${a.id}`} className="hover:text-primary transition-colors">
              <h3 className="font-bold text-xl mt-3 mb-3">{gt(a)}</h3>
            </a>
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">{gs(a)}</p>
            <span className="text-xs text-muted-foreground mt-4">{gm(a)}</span>
          </div>
        </div>
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground">
          {page + 1} / {items.length}
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        {items.map((_, i) => (
          <button key={i} onClick={() => setPage(i)}
            className={`w-8 h-1.5 rounded-full transition-all ${i === page ? "bg-primary w-12" : "bg-border/50"}`} />
        ))}
      </div>
    </div>
  );
}

/* ===== CAROUSEL 3D RING ===== */
export function Ring3D({ articles }: Props) {
  const [angle, setAngle] = useState(0);
  const { locale, gt, gc } = useH();
  const items = articles.slice(0, 6);
  const step = 360 / items.length;
  return (
    <div className="flex flex-col items-center gap-6">
      <div style={{ perspective: "800px", height: "320px", width: "100%" }} className="flex items-center justify-center">
        <div className="relative" style={{ transformStyle: "preserve-3d", transform: `rotateY(${angle}deg)`, transition: "transform 0.6s ease", width: "280px", height: "280px" }}>
          {items.map((a, i) => (
            <a key={a.id} href={`/${locale}/article/${a.id}`}
              className="absolute w-[240px] rounded-xl overflow-hidden border border-border/30 bg-card group"
              style={{ transform: `rotateY(${i * step}deg) translateZ(300px)`, backfaceVisibility: "hidden", left: "20px", top: "20px" }}>
              {a.image_url && <img src={a.image_url} alt="" className="w-full aspect-video object-cover" />}
              <div className="p-3">
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">{gc(a)}</span>
                <h4 className="font-semibold text-xs mt-1 line-clamp-2 group-hover:text-primary transition-colors">{gt(a)}</h4>
              </div>
            </a>
          ))}
        </div>
      </div>
      <div className="flex gap-3">
        <button onClick={() => setAngle(a => a + step)} className="px-4 py-2 rounded-full border border-border/50 text-sm hover:bg-card transition-colors">←</button>
        <button onClick={() => setAngle(a => a - step)} className="px-4 py-2 rounded-full border border-border/50 text-sm hover:bg-card transition-colors">→</button>
      </div>
    </div>
  );
}

/* ===== TYPEWRITER ===== */
export function Typewriter({ articles }: Props) {
  const [active, setActive] = useState(0);
  const [text, setText] = useState("");
  const { locale, gt, gs, gc, gm } = useH();
  const items = articles.slice(0, 5);
  const fullText = gt(items[active]);

  useEffect(() => {
    setText("");
    let i = 0;
    const interval = setInterval(() => {
      setText(fullText.slice(0, i + 1));
      i++;
      if (i >= fullText.length) clearInterval(interval);
    }, 30);
    return () => clearInterval(interval);
  }, [active, fullText]);

  return (
    <div className="rounded-2xl border border-border/30 bg-card overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2">
        {items[active].image_url && <img src={items[active].image_url} alt="" className="w-full aspect-video object-cover" />}
        <div className="p-6 flex flex-col justify-center">
          <span className="text-[10px] px-2.5 py-1 rounded-full bg-primary/10 text-primary w-fit">{gc(items[active])}</span>
          <a href={`/${locale}/article/${items[active].id}`} className="hover:text-primary transition-colors">
            <h3 className="font-bold text-xl mt-3 mb-2 min-h-[3.5rem]">{text}<span className="animate-pulse text-primary">|</span></h3>
          </a>
          <p className="text-sm text-muted-foreground line-clamp-2">{gs(items[active])}</p>
          <span className="text-xs text-muted-foreground mt-3">{items[active].source} • {gm(items[active])}</span>
        </div>
      </div>
      <div className="flex border-t border-border/30">
        {items.map((a, i) => (
          <button key={a.id} onClick={() => setActive(i)}
            className={`flex-1 p-3 text-xs text-start transition-colors border-r last:border-0 border-border/30 ${i === active ? "bg-primary/5 text-primary" : "text-muted-foreground hover:bg-card-hover"}`}>
            <span className="line-clamp-1">{gt(a)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ===== DASHBOARD ===== */
export function Dashboard({ articles }: Props) {
  const { locale, gt, gs, gc, gm } = useH();
  const items = articles.slice(0, 6);
  return (
    <div className="grid grid-cols-12 gap-3">
      {/* Main article */}
      <a href={`/${locale}/article/${items[0].id}`} className="col-span-8 row-span-2 rounded-2xl overflow-hidden border border-border/30 bg-card group relative" style={{ minHeight: "350px" }}>
        {items[0].image_url && <img src={items[0].image_url} alt="" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
        <div className="absolute bottom-0 p-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded bg-red-500 text-white text-[9px] font-bold">LIVE</span>
            <span className="text-[10px] text-white/70">{items[0].source}</span>
          </div>
          <h3 className="font-bold text-2xl text-white group-hover:text-primary transition-colors">{gt(items[0])}</h3>
          <p className="text-sm text-white/60 mt-2 line-clamp-2 max-w-2xl">{gs(items[0])}</p>
        </div>
      </a>
      {/* Stats-like sidebar */}
      <div className="col-span-4 flex flex-col gap-3">
        <div className="rounded-xl bg-card border border-border/30 p-4">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Trending Now</div>
          <div className="text-2xl font-bold text-primary">{items.length}</div>
          <div className="text-xs text-muted-foreground">Breaking Stories</div>
        </div>
        {items.slice(1, 4).map((a) => (
          <a key={a.id} href={`/${locale}/article/${a.id}`} className="rounded-xl bg-card border border-border/30 p-3 hover:border-primary/30 transition-all group flex gap-3">
            {a.image_url && <img src={a.image_url} alt="" className="w-14 h-14 object-cover rounded-lg flex-shrink-0" />}
            <div>
              <span className="text-[9px] text-primary">{gc(a)}</span>
              <h4 className="text-xs font-medium mt-0.5 group-hover:text-primary transition-colors line-clamp-2">{gt(a)}</h4>
            </div>
          </a>
        ))}
      </div>
      {/* Bottom bar */}
      {items.slice(4).map((a) => (
        <a key={a.id} href={`/${locale}/article/${a.id}`} className="col-span-6 rounded-xl bg-card border border-border/30 p-3 flex gap-3 group hover:border-primary/30 transition-all">
          {a.image_url && <img src={a.image_url} alt="" className="w-20 h-14 object-cover rounded-lg flex-shrink-0" />}
          <div>
            <span className="text-[9px] text-primary">{gc(a)}</span>
            <h4 className="text-xs font-medium mt-0.5 group-hover:text-primary transition-colors line-clamp-2">{gt(a)}</h4>
            <span className="text-[9px] text-muted-foreground">{gm(a)}</span>
          </div>
        </a>
      ))}
    </div>
  );
}

/* ===== SPLIT FLIP ===== */
export function SplitFlip({ articles }: Props) {
  const [current, setCurrent] = useState(0);
  const [flipping, setFlipping] = useState(false);
  const { locale, gt, gs, gc, gm } = useH();
  const items = articles.slice(0, 5);

  const flip = (dir: number) => {
    setFlipping(true);
    setTimeout(() => {
      setCurrent((c) => (c + dir + items.length) % items.length);
      setFlipping(false);
    }, 300);
  };

  const a = items[current];
  return (
    <div className="flex flex-col items-center gap-4">
      <div className={`w-full max-w-3xl rounded-2xl overflow-hidden border border-border/30 bg-card transition-all duration-300 ${flipping ? "scale-y-0" : "scale-y-100"}`}>
        <a href={`/${locale}/article/${a.id}`} className="block group">
          {a.image_url && <img src={a.image_url} alt="" className="w-full aspect-[2.5/1] object-cover" />}
          <div className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] px-2.5 py-1 rounded-full bg-primary/10 text-primary">{gc(a)}</span>
              <span className="text-[11px] text-muted-foreground">{a.source} • {gm(a)}</span>
            </div>
            <h3 className="font-bold text-xl group-hover:text-primary transition-colors">{gt(a)}</h3>
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{gs(a)}</p>
          </div>
        </a>
      </div>
      <div className="flex items-center gap-4">
        <button onClick={() => flip(-1)} className="w-10 h-10 rounded-full border border-border/50 flex items-center justify-center hover:bg-card transition-colors">←</button>
        <div className="flex gap-1.5">
          {items.map((_, i) => (
            <button key={i} onClick={() => { setFlipping(true); setTimeout(() => { setCurrent(i); setFlipping(false); }, 300); }}
              className={`w-2 h-2 rounded-full transition-all ${i === current ? "bg-primary w-5" : "bg-border/50"}`} />
          ))}
        </div>
        <button onClick={() => flip(1)} className="w-10 h-10 rounded-full border border-border/50 flex items-center justify-center hover:bg-card transition-colors">→</button>
      </div>
    </div>
  );
}

/* ===== PANORAMA ===== */
export function Panorama({ articles }: Props) {
  const { locale, gt, gc } = useH();
  const items = articles.slice(0, 5);
  const [hovered, setHovered] = useState<number | null>(null);
  return (
    <div className="flex h-[350px] rounded-2xl overflow-hidden border border-border/30">
      {items.map((a, i) => (
        <a key={a.id} href={`/${locale}/article/${a.id}`}
          onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
          className="relative overflow-hidden transition-all duration-500 group"
          style={{ flex: hovered === i ? 4 : hovered === null ? 1 : 0.5 }}>
          {a.image_url && <img src={a.image_url} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-0 p-4 w-full">
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-primary/30 text-primary backdrop-blur-sm">{gc(a)}</span>
            <h4 className={`font-bold text-white mt-1 transition-all duration-300 ${hovered === i ? "text-base line-clamp-none" : "text-xs line-clamp-1"}`}>{gt(a)}</h4>
          </div>
        </a>
      ))}
    </div>
  );
}
