"use client";

import { useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ProcessedArticle } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { ar, enUS } from "date-fns/locale";

interface Props {
  articles: ProcessedArticle[];
}

function useHelpers() {
  const locale = useLocale();
  const t = useTranslations();
  const isArabic = locale === "ar";
  const gt = (a: ProcessedArticle) => isArabic ? a.title_ar : a.title_en;
  const gs = (a: ProcessedArticle) => isArabic ? a.summary_ar : a.summary_en;
  const gc = (a: ProcessedArticle) => t(`categories.${a.category}`);
  const gm = (a: ProcessedArticle) => formatDistanceToNow(new Date(a.processed_at), { addSuffix: true, locale: isArabic ? ar : enUS });
  return { locale, isArabic, gt, gs, gc, gm };
}

/* ===== POLAROID WALL ===== */
export function PolaroidWall({ articles }: Props) {
  const { locale, gt, gc } = useHelpers();
  const rotations = [-6, 3, -4, 5, -2, 7, -3, 4];
  return (
    <div className="flex flex-wrap gap-6 justify-center py-8">
      {articles.slice(0, 6).map((a, i) => (
        <a key={a.id} href={`/${locale}/article/${a.id}`}
          className="w-[200px] bg-white rounded-sm p-2 pb-12 shadow-lg hover:scale-110 hover:z-20 hover:rotate-0 transition-all duration-300 group cursor-pointer"
          style={{ transform: `rotate(${rotations[i % rotations.length]}deg)` }}>
          {a.image_url && <img src={a.image_url} alt="" className="w-full aspect-square object-cover" />}
          <p className="text-black text-xs font-handwriting mt-2 text-center line-clamp-2 font-medium">{gt(a)}</p>
        </a>
      ))}
    </div>
  );
}

/* ===== FILM STRIP ===== */
export function FilmStrip({ articles }: Props) {
  const { locale, gt, gc, gm } = useHelpers();
  return (
    <div className="relative bg-[#1a1a1a] rounded-2xl py-6 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-8 flex">
        {Array(30).fill(0).map((_, i) => <div key={i} className="w-6 h-5 mx-1.5 mt-1.5 rounded-sm bg-background/20" />)}
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-8 flex">
        {Array(30).fill(0).map((_, i) => <div key={i} className="w-6 h-5 mx-1.5 mt-1.5 rounded-sm bg-background/20" />)}
      </div>
      <div className="flex gap-4 overflow-x-auto px-6 py-4 snap-x">
        {articles.slice(0, 8).map((a) => (
          <a key={a.id} href={`/${locale}/article/${a.id}`}
            className="flex-shrink-0 w-[250px] snap-center group">
            {a.image_url && <img src={a.image_url} alt="" className="w-full aspect-[3/2] object-cover rounded-sm group-hover:brightness-110 transition-all" />}
            <div className="mt-2">
              <span className="text-[9px] text-primary">{gc(a)}</span>
              <h4 className="text-xs font-medium text-white/90 mt-0.5 line-clamp-1 group-hover:text-primary transition-colors">{gt(a)}</h4>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

/* ===== HEXAGONAL ===== */
export function HexGrid({ articles }: Props) {
  const { locale, gt, gc } = useHelpers();
  const items = articles.slice(0, 5);
  const positions = [
    { x: 50, y: 10 }, { x: 20, y: 45 }, { x: 80, y: 45 }, { x: 35, y: 80 }, { x: 65, y: 80 }
  ];
  return (
    <div className="relative" style={{ height: "450px" }}>
      {items.map((a, i) => (
        <a key={a.id} href={`/${locale}/article/${a.id}`}
          className="absolute group hover:z-20 hover:scale-110 transition-all duration-300"
          style={{ left: `${positions[i].x}%`, top: `${positions[i].y}%`, transform: "translate(-50%, -50%)" }}>
          <div className="w-36 h-36 overflow-hidden border-2 border-border/30 group-hover:border-primary/50 transition-colors" style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}>
            {a.image_url && <img src={a.image_url} alt="" className="w-full h-full object-cover" />}
          </div>
          <div className="text-center mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-primary/20 text-primary">{gc(a)}</span>
            <h4 className="text-xs font-semibold mt-1 max-w-[150px] line-clamp-2">{gt(a)}</h4>
          </div>
        </a>
      ))}
    </div>
  );
}

/* ===== CUBE 3D ===== */
export function Cube3D({ articles }: Props) {
  const [face, setFace] = useState(0);
  const { locale, gt, gs, gc, gm } = useHelpers();
  const items = articles.slice(0, 4);
  const rotations = ["rotateY(0deg)", "rotateY(-90deg)", "rotateY(-180deg)", "rotateY(-270deg)"];

  return (
    <div className="flex flex-col items-center gap-6">
      <div style={{ perspective: "1000px", width: "500px", height: "350px" }}>
        <div className="relative w-full h-full transition-transform duration-700" style={{ transformStyle: "preserve-3d", transform: rotations[face] }}>
          {items.map((a, i) => {
            const transforms = [
              "rotateY(0deg) translateZ(250px)", "rotateY(90deg) translateZ(250px)",
              "rotateY(180deg) translateZ(250px)", "rotateY(270deg) translateZ(250px)"
            ];
            return (
              <a key={a.id} href={`/${locale}/article/${a.id}`}
                className="absolute inset-0 rounded-2xl overflow-hidden border border-border/30 bg-card group backface-hidden"
                style={{ transform: transforms[i], backfaceVisibility: "hidden" }}>
                {a.image_url && <img src={a.image_url} alt="" className="w-full h-2/3 object-cover" />}
                <div className="p-4">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">{gc(a)}</span>
                  <h3 className="font-bold text-sm mt-2 group-hover:text-primary transition-colors">{gt(a)}</h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{gs(a)}</p>
                </div>
              </a>
            );
          })}
        </div>
      </div>
      <div className="flex gap-2">
        {items.map((_, i) => (
          <button key={i} onClick={() => setFace(i)}
            className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all ${i === face ? "border-primary scale-110" : "border-border/50 opacity-60"}`}>
            {items[i].image_url && <img src={items[i].image_url} alt="" className="w-full h-full object-cover" />}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ===== TERMINAL/MATRIX ===== */
export function Terminal({ articles }: Props) {
  const { locale, gt, gc, gm } = useHelpers();
  return (
    <div className="rounded-2xl bg-black border border-green-500/30 p-4 font-mono">
      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-green-500/20">
        <div className="w-3 h-3 rounded-full bg-red-500" />
        <div className="w-3 h-3 rounded-full bg-yellow-500" />
        <div className="w-3 h-3 rounded-full bg-green-500" />
        <span className="text-green-500/60 text-xs ml-2">ai-pulse@news:~$ fetch --breaking</span>
      </div>
      <div className="space-y-2">
        <p className="text-green-500 text-xs animate-pulse">&gt; Loading breaking news feed...</p>
        {articles.slice(0, 6).map((a, i) => (
          <a key={a.id} href={`/${locale}/article/${a.id}`}
            className="block hover:bg-green-500/5 px-2 py-1.5 rounded transition-colors group">
            <div className="flex items-start gap-3">
              <span className="text-green-500/40 text-xs">[{String(i).padStart(2, "0")}]</span>
              <div>
                <span className="text-yellow-400 text-[10px]">[{gc(a)}]</span>
                <span className="text-green-400 text-xs ml-2 group-hover:text-green-300">{gt(a)}</span>
                <div className="flex gap-3 mt-0.5">
                  <span className="text-green-500/40 text-[10px]">src: {a.source}</span>
                  <span className="text-green-500/40 text-[10px]">time: {gm(a)}</span>
                </div>
              </div>
            </div>
          </a>
        ))}
        <p className="text-green-500/40 text-xs mt-2">$ <span className="animate-pulse">▊</span></p>
      </div>
    </div>
  );
}

/* ===== TV GUIDE ===== */
export function TVGuide({ articles }: Props) {
  const { locale, gt, gc, gm } = useHelpers();
  return (
    <div className="rounded-2xl overflow-hidden border border-border/30">
      <div className="bg-primary/10 px-4 py-2 flex items-center justify-between">
        <span className="text-sm font-bold text-primary">AI PULSE TV</span>
        <span className="text-[10px] text-muted-foreground">LIVE</span>
      </div>
      <div className="divide-y divide-border/20">
        {articles.slice(0, 6).map((a, i) => (
          <a key={a.id} href={`/${locale}/article/${a.id}`}
            className="flex items-center gap-4 p-3 hover:bg-card-hover transition-colors group">
            <div className="w-16 text-center flex-shrink-0">
              <div className={`text-xs font-bold ${i === 0 ? "text-red-400" : "text-muted-foreground"}`}>
                {i === 0 ? "NOW" : `CH ${i + 1}`}
              </div>
              {i === 0 && <div className="w-2 h-2 rounded-full bg-red-500 mx-auto mt-1 animate-pulse" />}
            </div>
            <div className="w-20 h-14 rounded-lg overflow-hidden flex-shrink-0">
              {a.image_url && <img src={a.image_url} alt="" className="w-full h-full object-cover" />}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">{gc(a)}</span>
              <h4 className="font-medium text-sm mt-1 line-clamp-1 group-hover:text-primary transition-colors">{gt(a)}</h4>
              <span className="text-[10px] text-muted-foreground">{a.source} • {gm(a)}</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

/* ===== WAVE ===== */
export function Wave({ articles }: Props) {
  const { locale, gt, gc } = useHelpers();
  const items = articles.slice(0, 6);
  return (
    <div className="flex items-end gap-3 justify-center py-8" style={{ height: "400px" }}>
      {items.map((a, i) => {
        const heights = [250, 320, 280, 350, 260, 300];
        return (
          <a key={a.id} href={`/${locale}/article/${a.id}`}
            className="flex-shrink-0 w-[180px] rounded-2xl overflow-hidden border border-border/30 bg-card group hover:-translate-y-4 hover:shadow-[0_10px_30px_rgba(124,58,237,0.2)] transition-all duration-300"
            style={{ height: `${heights[i]}px` }}>
            {a.image_url && <img src={a.image_url} alt="" className="w-full h-2/3 object-cover group-hover:scale-105 transition-transform duration-500" />}
            <div className="p-3">
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">{gc(a)}</span>
              <h4 className="font-semibold text-xs mt-1 leading-snug group-hover:text-primary transition-colors line-clamp-2">{gt(a)}</h4>
            </div>
          </a>
        );
      })}
    </div>
  );
}

/* ===== KANBAN ===== */
export function Kanban({ articles }: Props) {
  const { locale, gt, gc, gm } = useHelpers();
  const categories = [...new Set(articles.slice(0, 8).map(a => a.category))].slice(0, 3);
  return (
    <div className="grid grid-cols-3 gap-4">
      {categories.map((cat) => {
        const catArticles = articles.filter(a => a.category === cat).slice(0, 3);
        return (
          <div key={cat} className="rounded-2xl bg-card border border-border/30 p-4">
            <h3 className="text-sm font-bold text-primary mb-3 pb-2 border-b border-border/30">{gc(catArticles[0])}</h3>
            <div className="space-y-3">
              {catArticles.map((a) => (
                <a key={a.id} href={`/${locale}/article/${a.id}`}
                  className="block p-3 rounded-xl bg-background border border-border/20 hover:border-primary/30 hover:-translate-y-1 transition-all group">
                  {a.image_url && <img src={a.image_url} alt="" className="w-full aspect-video object-cover rounded-lg mb-2" />}
                  <h4 className="text-xs font-medium group-hover:text-primary transition-colors line-clamp-2">{gt(a)}</h4>
                  <span className="text-[9px] text-muted-foreground mt-1 block">{gm(a)}</span>
                </a>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ===== FLIP CARDS ===== */
export function FlipCards({ articles }: Props) {
  const { locale, gt, gs, gc, gm } = useHelpers();
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {articles.slice(0, 3).map((a) => (
        <div key={a.id} className="group" style={{ perspective: "1000px", height: "300px" }}>
          <div className="relative w-full h-full transition-transform duration-700 group-hover:[transform:rotateY(180deg)]" style={{ transformStyle: "preserve-3d" }}>
            {/* Front */}
            <div className="absolute inset-0 rounded-2xl overflow-hidden border border-border/30 bg-card" style={{ backfaceVisibility: "hidden" }}>
              {a.image_url && <img src={a.image_url} alt="" className="w-full h-full object-cover" />}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-0 p-4">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/30 text-primary">{gc(a)}</span>
                <h3 className="font-bold text-white mt-2">{gt(a)}</h3>
              </div>
            </div>
            {/* Back */}
            <div className="absolute inset-0 rounded-2xl overflow-hidden border border-primary/30 bg-card p-5 flex flex-col justify-center [transform:rotateY(180deg)]" style={{ backfaceVisibility: "hidden" }}>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary w-fit">{gc(a)}</span>
              <h3 className="font-bold text-base mt-3 mb-2">{gt(a)}</h3>
              <p className="text-sm text-muted-foreground line-clamp-4">{gs(a)}</p>
              <div className="mt-auto pt-3 flex justify-between items-center">
                <span className="text-[10px] text-muted-foreground">{a.source} • {gm(a)}</span>
                <a href={`/${locale}/article/${a.id}`} className="text-xs text-primary hover:underline">→</a>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ===== RADIAL MENU ===== */
export function RadialMenu({ articles }: Props) {
  const [hovered, setHovered] = useState<number | null>(null);
  const { locale, gt, gc } = useHelpers();
  const items = articles.slice(0, 6);
  const active = hovered !== null ? items[hovered] : items[0];

  return (
    <div className="flex items-center justify-center gap-12 py-8">
      <div className="relative w-[300px] h-[300px]">
        {items.map((a, i) => {
          const angle = (i * 360) / items.length - 90;
          const rad = (angle * Math.PI) / 180;
          const x = 130 + Math.cos(rad) * 120;
          const y = 130 + Math.sin(rad) * 120;
          return (
            <button key={a.id} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
              className={`absolute w-14 h-14 rounded-full overflow-hidden border-2 transition-all duration-300 ${hovered === i ? "border-primary scale-125 shadow-[0_0_15px_rgba(99,102,241,0.4)]" : "border-border/50"}`}
              style={{ left: x - 28, top: y - 28 }}>
              {a.image_url && <img src={a.image_url} alt="" className="w-full h-full object-cover" />}
            </button>
          );
        })}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
          <span className="text-[10px] text-primary font-bold">AI</span>
        </div>
      </div>
      <a href={`/${locale}/article/${active.id}`} className="max-w-sm group">
        {active.image_url && <img src={active.image_url} alt="" className="w-full aspect-video object-cover rounded-xl mb-3 border border-border/30" />}
        <span className="text-[10px] px-2.5 py-1 rounded-full bg-primary/10 text-primary">{gc(active)}</span>
        <h3 className="font-bold text-lg mt-2 group-hover:text-primary transition-colors">{gt(active)}</h3>
      </a>
    </div>
  );
}
