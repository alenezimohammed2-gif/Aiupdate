"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { ProcessedArticle } from "@/lib/types";
import CarouselVariant from "./CarouselVariant";
import { Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { PolaroidWall, FilmStrip, HexGrid, Cube3D, Terminal, TVGuide, Wave, Kanban, FlipCards, RadialMenu } from "./ExtraVariants";
import { WindowsTiles, CardDeck, ScrollReveal, NeonGlow, BookPages, Ring3D, Typewriter, Dashboard, SplitFlip, Panorama } from "./ExtraVariants2";
import { formatDistanceToNow } from "date-fns";
import { ar, enUS } from "date-fns/locale";

type DisplayMode =
  | "carousel"
  | "ticker"
  | "hero-cards"
  | "split-screen"
  | "bento"
  | "magazine"
  | "marquee-featured"
  | "glass-cards"
  | "stacked"
  | "timeline"
  | "netflix"
  | "stories"
  | "coverflow"
  | "accordion"
  | "spotlight"
  | "newspaper"
  | "mosaic"
  | "orbit"
  | "polaroid"
  | "filmstrip"
  | "hexgrid"
  | "cube3d"
  | "terminal"
  | "tvguide"
  | "wave"
  | "kanban"
  | "flipcards"
  | "radial"
  | "wintiles"
  | "carddeck"
  | "scrollreveal"
  | "neonglow"
  | "bookpages"
  | "ring3d"
  | "typewriter"
  | "dashboard"
  | "splitflip"
  | "panorama";

const MODES: { id: DisplayMode; label: string; labelAr: string }[] = [
  { id: "carousel", label: "Carousel", labelAr: "سلايدر" },
  { id: "ticker", label: "Ticker Tape", labelAr: "شريط أخبار" },
  { id: "hero-cards", label: "Hero Cards 3D", labelAr: "كروت 3D" },
  { id: "split-screen", label: "Split Screen", labelAr: "شاشة مقسومة" },
  { id: "bento", label: "Bento Grid", labelAr: "شبكة Bento" },
  { id: "magazine", label: "Magazine", labelAr: "مجلة" },
  { id: "marquee-featured", label: "Marquee + Featured", labelAr: "شريط + مميز" },
  { id: "glass-cards", label: "Glass Cards", labelAr: "كروت زجاجية" },
  { id: "stacked", label: "Stacked Cards", labelAr: "كروت متراصة" },
  { id: "timeline", label: "Timeline", labelAr: "خط زمني" },
  { id: "netflix", label: "Netflix Row", labelAr: "صف Netflix" },
  { id: "stories", label: "Stories", labelAr: "قصص" },
  { id: "coverflow", label: "Coverflow", labelAr: "تدفق أغلفة" },
  { id: "accordion", label: "Accordion", labelAr: "أكورديون" },
  { id: "spotlight", label: "Spotlight Stage", labelAr: "منصة مضيئة" },
  { id: "newspaper", label: "Newspaper", labelAr: "جريدة" },
  { id: "mosaic", label: "Mosaic", labelAr: "فسيفساء" },
  { id: "orbit", label: "Orbit", labelAr: "مدار" },
  { id: "polaroid", label: "Polaroid Wall", labelAr: "حائط صور" },
  { id: "filmstrip", label: "Film Strip", labelAr: "شريط فيلم" },
  { id: "hexgrid", label: "Hexagonal", labelAr: "سداسي" },
  { id: "cube3d", label: "3D Cube", labelAr: "مكعب 3D" },
  { id: "terminal", label: "Terminal", labelAr: "شاشة أوامر" },
  { id: "tvguide", label: "TV Guide", labelAr: "دليل تلفزيون" },
  { id: "wave", label: "Wave", labelAr: "موجة" },
  { id: "kanban", label: "Kanban Board", labelAr: "لوحة Kanban" },
  { id: "flipcards", label: "Flip Cards", labelAr: "كروت تنقلب" },
  { id: "radial", label: "Radial Menu", labelAr: "قائمة دائرية" },
  { id: "wintiles", label: "Windows Tiles", labelAr: "بلاطات ملونة" },
  { id: "carddeck", label: "Card Deck", labelAr: "رزمة كروت" },
  { id: "scrollreveal", label: "Numbered List", labelAr: "قائمة مرقمة" },
  { id: "neonglow", label: "Neon Glow", labelAr: "نيون متوهج" },
  { id: "bookpages", label: "Book Pages", labelAr: "صفحات كتاب" },
  { id: "ring3d", label: "3D Ring", labelAr: "حلقة 3D" },
  { id: "typewriter", label: "Typewriter", labelAr: "آلة كاتبة" },
  { id: "dashboard", label: "Dashboard", labelAr: "لوحة معلومات" },
  { id: "splitflip", label: "Split Flip", labelAr: "انقلاب" },
  { id: "panorama", label: "Panorama", labelAr: "بانوراما" },
];

interface Props {
  articles: ProcessedArticle[];
}

function useArticleHelpers() {
  const locale = useLocale();
  const t = useTranslations();
  const isArabic = locale === "ar";
  const getTitle = (a: ProcessedArticle) => isArabic ? a.title_ar : a.title_en;
  const getSummary = (a: ProcessedArticle) => isArabic ? a.summary_ar : a.summary_en;
  const getCat = (a: ProcessedArticle) => t(`categories.${a.category}`);
  const getTime = (a: ProcessedArticle) =>
    formatDistanceToNow(new Date(a.processed_at), { addSuffix: true, locale: isArabic ? ar : enUS });
  return { locale, isArabic, getTitle, getSummary, getCat, getTime };
}

/* ===== TICKER TAPE ===== */
function TickerTape({ articles }: Props) {
  const { locale, getTitle, getCat } = useArticleHelpers();
  return (
    <div className="overflow-hidden rounded-xl bg-card border border-border/30 py-3">
      <div className="flex animate-ticker whitespace-nowrap">
        {[...articles, ...articles].map((a, i) => (
          <a key={i} href={`/${locale}/article/${a.id}`} className="inline-flex items-center gap-3 px-6 hover:text-primary transition-colors">
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{getCat(a)}</span>
            <span className="text-sm font-medium">{getTitle(a)}</span>
            <span className="text-muted-foreground">•</span>
          </a>
        ))}
      </div>
    </div>
  );
}

/* ===== HERO CARDS 3D ===== */
function HeroCards3D({ articles }: Props) {
  const [active, setActive] = useState(1);
  const { locale, getTitle, getCat, getTime } = useArticleHelpers();
  const items = articles.slice(0, 5);
  return (
    <div className="flex items-center justify-center gap-4 py-4 overflow-hidden">
      {items.map((a, i) => {
        const isActive = i === active;
        const offset = i - active;
        return (
          <a key={a.id} href={isActive ? `/${locale}/article/${a.id}` : undefined}
            onClick={(e) => { if (!isActive) { e.preventDefault(); setActive(i); } }}
            className="flex-shrink-0 rounded-2xl overflow-hidden border border-border/30 bg-card transition-all duration-500 cursor-pointer"
            style={{ width: isActive ? "500px" : "200px", height: isActive ? "320px" : "250px", transform: `translateX(${offset * 5}px) scale(${isActive ? 1 : 0.9})`, opacity: Math.abs(offset) > 2 ? 0.3 : 1, zIndex: isActive ? 10 : 5 - Math.abs(offset) }}>
            {a.image_url && <img src={a.image_url} alt="" className="w-full h-2/3 object-cover" />}
            <div className="p-3">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">{getCat(a)}</span>
              <h3 className={`font-bold mt-1 leading-snug ${isActive ? "text-sm" : "text-xs line-clamp-2"}`}>{getTitle(a)}</h3>
              {isActive && <p className="text-[11px] text-muted-foreground mt-1">{getTime(a)}</p>}
            </div>
          </a>
        );
      })}
    </div>
  );
}

/* ===== SPLIT SCREEN ===== */
function SplitScreen({ articles }: Props) {
  const [selected, setSelected] = useState(0);
  const { locale, isArabic, getTitle, getSummary, getCat, getTime } = useArticleHelpers();
  const main = articles[selected];
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 rounded-2xl overflow-hidden border border-border/30 bg-card">
      <a href={`/${locale}/article/${main.id}`} className="md:col-span-3 group">
        {main.image_url && <img src={main.image_url} alt="" className="w-full aspect-[4/3] object-cover group-hover:scale-[1.02] transition-transform duration-500" />}
        <div className="p-5">
          <span className="text-[11px] px-2.5 py-1 rounded-full bg-primary/10 text-primary">{getCat(main)}</span>
          <h3 className="font-bold text-xl mt-3 mb-2 group-hover:text-primary transition-colors">{getTitle(main)}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">{getSummary(main)}</p>
        </div>
      </a>
      <div className={`md:col-span-2 flex flex-col divide-y divide-border/30 ${isArabic ? "border-r" : "border-l"} border-border/30`}>
        {articles.slice(0, 5).map((a, i) => (
          <button key={a.id} onClick={() => setSelected(i)}
            className={`p-4 text-start transition-colors ${i === selected ? "bg-primary/5 border-s-2 border-primary" : "hover:bg-card-hover"}`}>
            <span className="text-[10px] text-primary">{getCat(a)} • {getTime(a)}</span>
            <h4 className="font-medium text-sm mt-1 leading-snug">{getTitle(a)}</h4>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ===== BENTO GRID ===== */
function BentoGrid({ articles }: Props) {
  const { locale, getTitle, getCat, getTime } = useArticleHelpers();
  const [main, ...rest] = articles.slice(0, 5);
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 auto-rows-[200px]">
      <a href={`/${locale}/article/${main.id}`} className="col-span-2 row-span-2 rounded-2xl overflow-hidden border border-border/30 bg-card group relative">
        {main.image_url && <img src={main.image_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <div className="absolute bottom-0 p-5">
          <span className="text-[11px] px-2.5 py-1 rounded-full bg-primary/20 text-primary backdrop-blur-sm">{getCat(main)}</span>
          <h3 className="font-bold text-lg mt-2 text-white group-hover:text-primary transition-colors">{getTitle(main)}</h3>
          <p className="text-xs text-white/60 mt-1">{getTime(main)}</p>
        </div>
      </a>
      {rest.map((a) => (
        <a key={a.id} href={`/${locale}/article/${a.id}`} className="rounded-2xl overflow-hidden border border-border/30 bg-card group relative">
          {a.image_url && <img src={a.image_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <div className="absolute bottom-0 p-3">
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-primary/20 text-primary backdrop-blur-sm">{getCat(a)}</span>
            <h4 className="font-semibold text-xs mt-1 text-white line-clamp-2">{getTitle(a)}</h4>
          </div>
        </a>
      ))}
    </div>
  );
}

/* ===== MAGAZINE ===== */
function MagazineLayout({ articles }: Props) {
  const { locale, getTitle, getSummary, getCat, getTime } = useArticleHelpers();
  const [main, ...side] = articles.slice(0, 4);
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <a href={`/${locale}/article/${main.id}`} className="md:col-span-2 rounded-2xl overflow-hidden border border-border/30 bg-card group">
        {main.image_url && <img src={main.image_url} alt="" className="w-full aspect-video object-cover group-hover:scale-[1.02] transition-transform duration-500" />}
        <div className="p-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] px-2.5 py-1 rounded-full bg-primary/10 text-primary">{getCat(main)}</span>
            <span className="text-[11px] text-muted-foreground">{main.source} • {getTime(main)}</span>
          </div>
          <h3 className="font-bold text-xl mb-2 group-hover:text-primary transition-colors">{getTitle(main)}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">{getSummary(main)}</p>
        </div>
      </a>
      <div className="flex flex-col gap-4">
        {side.map((a) => (
          <a key={a.id} href={`/${locale}/article/${a.id}`} className="rounded-2xl overflow-hidden border border-border/30 bg-card group flex-1">
            <div className="flex gap-3 p-3 h-full">
              {a.image_url && <img src={a.image_url} alt="" className="w-24 h-24 object-cover rounded-xl flex-shrink-0" />}
              <div className="flex flex-col justify-center">
                <span className="text-[10px] text-primary mb-1">{getCat(a)}</span>
                <h4 className="font-semibold text-sm leading-snug group-hover:text-primary transition-colors line-clamp-2">{getTitle(a)}</h4>
                <span className="text-[10px] text-muted-foreground mt-1">{getTime(a)}</span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

/* ===== MARQUEE + FEATURED ===== */
function MarqueeFeatured({ articles }: Props) {
  const { locale, getTitle, getSummary, getCat, getTime } = useArticleHelpers();
  const [main, ...rest] = articles;
  return (
    <div>
      <a href={`/${locale}/article/${main.id}`} className="block rounded-2xl overflow-hidden border border-border/30 bg-card group mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {main.image_url && <img src={main.image_url} alt="" className="w-full aspect-video object-cover" />}
          <div className="p-6 flex flex-col justify-center">
            <span className="text-[11px] px-2.5 py-1 rounded-full bg-primary/10 text-primary w-fit mb-3">{getCat(main)}</span>
            <h3 className="font-bold text-xl mb-2 group-hover:text-primary transition-colors">{getTitle(main)}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{getSummary(main)}</p>
            <span className="text-xs text-muted-foreground">{main.source} • {getTime(main)}</span>
          </div>
        </div>
      </a>
      <div className="overflow-hidden rounded-xl bg-card border border-border/30 py-2.5">
        <div className="flex animate-ticker whitespace-nowrap">
          {[...rest, ...rest].map((a, i) => (
            <a key={i} href={`/${locale}/article/${a.id}`} className="inline-flex items-center gap-2 px-5 hover:text-primary transition-colors">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span className="text-sm font-medium">{getTitle(a)}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ===== GLASS CARDS ===== */
function GlassCards({ articles }: Props) {
  const { locale, getTitle, getCat, getTime } = useArticleHelpers();
  return (
    <div className="relative rounded-2xl overflow-hidden p-6" style={{ minHeight: "350px" }}>
      {articles[0]?.image_url && <img src={articles[0].image_url} alt="" className="absolute inset-0 w-full h-full object-cover blur-sm scale-105 opacity-30" />}
      <div className="absolute inset-0 bg-background/60" />
      <div className="relative z-10 flex gap-4 overflow-x-auto pb-4 snap-x">
        {articles.slice(0, 5).map((a) => (
          <a key={a.id} href={`/${locale}/article/${a.id}`}
            className="flex-shrink-0 w-[280px] snap-center rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 hover:bg-white/10 transition-all group">
            {a.image_url && <img src={a.image_url} alt="" className="w-full aspect-video object-cover rounded-lg mb-3" />}
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary">{getCat(a)}</span>
            <h4 className="font-semibold text-sm mt-2 leading-snug group-hover:text-primary transition-colors line-clamp-2">{getTitle(a)}</h4>
            <span className="text-[10px] text-muted-foreground mt-2 block">{getTime(a)}</span>
          </a>
        ))}
      </div>
    </div>
  );
}

/* ===== STACKED CARDS ===== */
function StackedCards({ articles }: Props) {
  const [top, setTop] = useState(0);
  const { locale, getTitle, getSummary, getCat, getTime } = useArticleHelpers();
  const items = articles.slice(0, 4);
  return (
    <div className="relative flex justify-center" style={{ height: "400px" }}>
      {items.map((a, i) => {
        const pos = (i - top + items.length) % items.length;
        return (
          <div key={a.id} onClick={() => pos === 0 && setTop((t) => (t + 1) % items.length)}
            className="absolute w-full max-w-2xl rounded-2xl overflow-hidden border border-border/30 bg-card transition-all duration-500 cursor-pointer"
            style={{ transform: `translateY(${pos * 15}px) scale(${1 - pos * 0.05})`, zIndex: items.length - pos, opacity: pos > 2 ? 0 : 1 - pos * 0.15 }}>
            <a href={pos === 0 ? `/${locale}/article/${a.id}` : undefined} className="block group">
              {a.image_url && <img src={a.image_url} alt="" className="w-full aspect-[3/1] object-cover" />}
              <div className="p-5">
                <span className="text-[11px] px-2.5 py-1 rounded-full bg-primary/10 text-primary">{getCat(a)}</span>
                <h3 className="font-bold text-lg mt-2 group-hover:text-primary transition-colors">{getTitle(a)}</h3>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{getSummary(a)}</p>
                <span className="text-xs text-muted-foreground mt-2 block">{a.source} • {getTime(a)}</span>
              </div>
            </a>
          </div>
        );
      })}
    </div>
  );
}

/* ===== TIMELINE ===== */
function TimelineHorizontal({ articles }: Props) {
  const { locale, getTitle, getCat, getTime } = useArticleHelpers();
  return (
    <div className="relative">
      <div className="absolute top-1/2 left-0 right-0 h-px bg-border/50" />
      <div className="flex gap-6 overflow-x-auto pb-4 snap-x">
        {articles.slice(0, 6).map((a, i) => (
          <a key={a.id} href={`/${locale}/article/${a.id}`}
            className={`flex-shrink-0 w-[250px] snap-center group ${i % 2 === 0 ? "pt-8" : "pb-8"}`}>
            <div className="flex flex-col items-center">
              {i % 2 === 0 && (
                <div className="rounded-xl overflow-hidden border border-border/30 bg-card mb-4 hover:border-primary/40 transition-all">
                  {a.image_url && <img src={a.image_url} alt="" className="w-full aspect-video object-cover" />}
                  <div className="p-3">
                    <span className="text-[10px] text-primary">{getCat(a)}</span>
                    <h4 className="font-semibold text-xs mt-1 group-hover:text-primary transition-colors line-clamp-2">{getTitle(a)}</h4>
                  </div>
                </div>
              )}
              <div className="w-3 h-3 rounded-full bg-primary border-2 border-background z-10" />
              <span className="text-[10px] text-muted-foreground mt-1">{getTime(a)}</span>
              {i % 2 !== 0 && (
                <div className="rounded-xl overflow-hidden border border-border/30 bg-card mt-4 hover:border-primary/40 transition-all">
                  {a.image_url && <img src={a.image_url} alt="" className="w-full aspect-video object-cover" />}
                  <div className="p-3">
                    <span className="text-[10px] text-primary">{getCat(a)}</span>
                    <h4 className="font-semibold text-xs mt-1 group-hover:text-primary transition-colors line-clamp-2">{getTitle(a)}</h4>
                  </div>
                </div>
              )}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

/* ===== NETFLIX ROW ===== */
function NetflixRow({ articles }: Props) {
  const { locale, getTitle, getCat } = useArticleHelpers();
  return (
    <div className="flex gap-3 overflow-x-auto pb-4 snap-x -mx-2 px-2">
      {articles.slice(0, 8).map((a) => (
        <a key={a.id} href={`/${locale}/article/${a.id}`}
          className="flex-shrink-0 w-[220px] snap-start rounded-xl overflow-hidden border border-border/30 bg-card group hover:scale-110 hover:z-20 hover:shadow-[0_10px_40px_rgba(0,0,0,0.5)] transition-all duration-300 relative">
          {a.image_url && <img src={a.image_url} alt="" className="w-full aspect-[3/2] object-cover" />}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute bottom-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-primary/30 text-primary">{getCat(a)}</span>
            <h4 className="font-bold text-xs mt-1 text-white line-clamp-2">{getTitle(a)}</h4>
          </div>
        </a>
      ))}
    </div>
  );
}

/* ===== STORIES ===== */
function Stories({ articles }: Props) {
  const [active, setActive] = useState<number | null>(null);
  const { locale, getTitle, getSummary, getCat, getTime } = useArticleHelpers();
  const items = articles.slice(0, 6);

  return (
    <>
      <div className="flex gap-4 justify-center py-4">
        {items.map((a, i) => (
          <button key={a.id} onClick={() => setActive(i)}
            className="flex flex-col items-center gap-2 group">
            <div className={`w-20 h-20 rounded-full p-[3px] transition-all ${active === i ? "bg-primary" : "bg-gradient-to-br from-primary via-accent to-primary"}`}>
              <div className="w-full h-full rounded-full overflow-hidden border-2 border-background">
                {a.image_url && <img src={a.image_url} alt="" className="w-full h-full object-cover" />}
              </div>
            </div>
            <span className="text-[10px] text-muted-foreground group-hover:text-foreground transition-colors line-clamp-1 w-20 text-center">{a.source}</span>
          </button>
        ))}
      </div>
      {active !== null && (
        <a href={`/${locale}/article/${items[active].id}`}
          className="block rounded-2xl overflow-hidden border border-border/30 bg-card group animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {items[active].image_url && <img src={items[active].image_url} alt="" className="w-full aspect-video object-cover" />}
            <div className="p-6 flex flex-col justify-center">
              <span className="text-[11px] px-2.5 py-1 rounded-full bg-primary/10 text-primary w-fit mb-3">{getCat(items[active])}</span>
              <h3 className="font-bold text-xl mb-2 group-hover:text-primary transition-colors">{getTitle(items[active])}</h3>
              <p className="text-sm text-muted-foreground line-clamp-3">{getSummary(items[active])}</p>
              <span className="text-xs text-muted-foreground mt-3">{items[active].source} • {getTime(items[active])}</span>
            </div>
          </div>
        </a>
      )}
    </>
  );
}

/* ===== COVERFLOW ===== */
function Coverflow({ articles }: Props) {
  const [active, setActive] = useState(2);
  const { locale, getTitle, getCat, getTime } = useArticleHelpers();
  const items = articles.slice(0, 5);
  return (
    <div className="flex items-center justify-center py-8" style={{ perspective: "1200px" }}>
      {items.map((a, i) => {
        const offset = i - active;
        const absOffset = Math.abs(offset);
        return (
          <a key={a.id} href={offset === 0 ? `/${locale}/article/${a.id}` : undefined}
            onClick={(e) => { if (offset !== 0) { e.preventDefault(); setActive(i); } }}
            className="flex-shrink-0 rounded-2xl overflow-hidden border border-border/30 bg-card transition-all duration-500 cursor-pointer group"
            style={{
              width: offset === 0 ? "450px" : "280px",
              marginLeft: i === 0 ? 0 : "-40px",
              transform: `rotateY(${offset * -25}deg) translateZ(${offset === 0 ? 50 : -100}px) scale(${offset === 0 ? 1 : 0.8})`,
              zIndex: 10 - absOffset,
              opacity: absOffset > 2 ? 0.2 : 1 - absOffset * 0.2,
              transformStyle: "preserve-3d",
            }}>
            {a.image_url && <img src={a.image_url} alt="" className="w-full aspect-video object-cover" />}
            <div className="p-4">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">{getCat(a)}</span>
              <h3 className={`font-bold mt-2 leading-snug group-hover:text-primary transition-colors ${offset === 0 ? "text-base" : "text-xs line-clamp-1"}`}>{getTitle(a)}</h3>
              {offset === 0 && <p className="text-xs text-muted-foreground mt-1">{a.source} • {getTime(a)}</p>}
            </div>
          </a>
        );
      })}
    </div>
  );
}

/* ===== ACCORDION ===== */
function Accordion({ articles }: Props) {
  const [expanded, setExpanded] = useState(0);
  const { locale, getTitle, getSummary, getCat, getTime } = useArticleHelpers();
  const items = articles.slice(0, 5);
  return (
    <div className="flex gap-2 h-[350px] rounded-2xl overflow-hidden">
      {items.map((a, i) => (
        <a key={a.id} href={`/${locale}/article/${a.id}`}
          onMouseEnter={() => setExpanded(i)}
          className={`relative overflow-hidden rounded-xl transition-all duration-500 group cursor-pointer ${i === expanded ? "flex-[4]" : "flex-1"}`}>
          {a.image_url && <img src={a.image_url} alt="" className="absolute inset-0 w-full h-full object-cover" />}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
          <div className="absolute bottom-0 p-4 w-full">
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/30 text-primary backdrop-blur-sm">{getCat(a)}</span>
            {i === expanded ? (
              <>
                <h3 className="font-bold text-lg mt-2 text-white group-hover:text-primary transition-colors">{getTitle(a)}</h3>
                <p className="text-xs text-white/70 mt-1 line-clamp-2">{getSummary(a)}</p>
                <span className="text-[10px] text-white/50 mt-2 block">{a.source} • {getTime(a)}</span>
              </>
            ) : (
              <h4 className="font-semibold text-xs mt-2 text-white writing-vertical" style={{ writingMode: "vertical-rl", textOrientation: "mixed", maxHeight: "200px" }}>{getTitle(a)}</h4>
            )}
          </div>
        </a>
      ))}
    </div>
  );
}

/* ===== SPOTLIGHT STAGE ===== */
function SpotlightStage({ articles }: Props) {
  const [active, setActive] = useState(0);
  const { locale, getTitle, getSummary, getCat, getTime } = useArticleHelpers();
  const items = articles.slice(0, 5);
  const main = items[active];

  return (
    <div className="relative rounded-2xl overflow-hidden bg-black" style={{ minHeight: "420px" }}>
      {main.image_url && <img src={main.image_url} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20 blur-md scale-110 transition-all duration-700" />}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-black/80" />
      <div className="relative z-10 flex flex-col items-center justify-center h-full p-8 text-center" style={{ minHeight: "420px" }}>
        <div className="mb-6 rounded-2xl overflow-hidden shadow-[0_0_60px_rgba(99,102,241,0.3)] border border-primary/20 transition-all duration-500 max-w-lg">
          {main.image_url && <img src={main.image_url} alt="" className="w-full aspect-video object-cover" />}
        </div>
        <span className="text-[11px] px-3 py-1 rounded-full bg-primary/20 text-primary mb-3">{getCat(main)}</span>
        <a href={`/${locale}/article/${main.id}`} className="hover:text-primary transition-colors">
          <h3 className="font-bold text-2xl text-white max-w-2xl">{getTitle(main)}</h3>
        </a>
        <p className="text-sm text-white/60 mt-2 max-w-xl line-clamp-2">{getSummary(main)}</p>
        <span className="text-xs text-white/40 mt-2">{main.source} • {getTime(main)}</span>
        <div className="flex gap-3 mt-6">
          {items.map((a, i) => (
            <button key={a.id} onClick={() => setActive(i)}
              className={`w-12 h-12 rounded-full overflow-hidden border-2 transition-all ${i === active ? "border-primary scale-110" : "border-white/20 opacity-60 hover:opacity-100"}`}>
              {a.image_url && <img src={a.image_url} alt="" className="w-full h-full object-cover" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ===== NEWSPAPER ===== */
function NewspaperLayout({ articles }: Props) {
  const { locale, getTitle, getSummary, getCat, getTime } = useArticleHelpers();
  const items = articles.slice(0, 5);
  const [active, setActive] = useState(0);

  const [fading, setFading] = useState(false);
  const headline = items[active];
  const others = items.filter((_, i) => i !== active);

  // Wrap setActive with fade effect
  const changeArticle = useCallback((next: number) => {
    setFading(true);
    setTimeout(() => {
      setActive(next);
      setFading(false);
    }, 400);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setActive((prev) => (prev + 1) % items.length);
        setFading(false);
      }, 400);
    }, 7000);
    return () => clearInterval(timer);
  }, [items.length]);

  return (
    <div className="border border-border/30 rounded-2xl bg-card p-6">
      <a href={`/${locale}/article/${headline.id}`} className={`block group mb-4 pb-4 border-b border-border/30 transition-all duration-400 ${fading ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"}`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="col-span-1 md:col-span-2">
            <h3 className="font-serif font-bold text-xl md:text-2xl mb-3 group-hover:text-primary transition-colors">{getTitle(headline)}</h3>
            {headline.image_url && <img src={headline.image_url} alt="" className="w-full aspect-video object-cover rounded-lg" />}
          </div>
          <div className="flex flex-col justify-between h-full">
            <p className="text-sm md:text-xl text-muted-foreground leading-relaxed md:leading-loose">{getSummary(headline)}</p>
            <div>
              <span className="text-sm md:text-base text-primary block">{headline.source} • {getTime(headline)}</span>
              {/* Progress bar */}
              <div className="mt-2 h-0.5 bg-border/30 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full animate-progress" key={active} />
              </div>
            </div>
          </div>
        </div>
      </a>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
        {others.map((a, i) => (
          <button key={a.id} onClick={() => changeArticle(items.indexOf(a))}
            className="group border-r last:border-0 border-border/20 pr-4 last:pr-0 text-start hover:opacity-80 transition-opacity">
            <span className="text-[9px] text-primary font-medium">{getCat(a)}</span>
            <h4 className="font-serif font-semibold text-sm mt-1 leading-snug group-hover:text-primary transition-colors">{getTitle(a)}</h4>
            <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{getSummary(a)}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ===== MOSAIC ===== */
function Mosaic({ articles }: Props) {
  const { locale, getTitle, getCat } = useArticleHelpers();
  const items = articles.slice(0, 6);
  const spans = ["col-span-2 row-span-2", "col-span-1 row-span-1", "col-span-1 row-span-2", "col-span-1 row-span-1", "col-span-2 row-span-1", "col-span-1 row-span-1"];
  return (
    <div className="grid grid-cols-4 auto-rows-[140px] gap-2 rounded-2xl overflow-hidden">
      {items.map((a, i) => (
        <a key={a.id} href={`/${locale}/article/${a.id}`}
          className={`${spans[i]} relative rounded-xl overflow-hidden group border border-border/30`}>
          {a.image_url && <img src={a.image_url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-90 transition-opacity" />
          <div className="absolute bottom-0 p-3">
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-primary/30 text-primary backdrop-blur-sm">{getCat(a)}</span>
            <h4 className={`font-bold text-white mt-1 group-hover:text-primary transition-colors ${i === 0 ? "text-base" : "text-xs line-clamp-2"}`}>{getTitle(a)}</h4>
          </div>
        </a>
      ))}
    </div>
  );
}

/* ===== ORBIT ===== */
function Orbit({ articles }: Props) {
  const [active, setActive] = useState(0);
  const { locale, getTitle, getSummary, getCat, getTime } = useArticleHelpers();
  const items = articles.slice(0, 5);
  const main = items[active];

  return (
    <div className="relative flex items-center justify-center" style={{ height: "450px" }}>
      <div className="absolute w-[350px] h-[350px] rounded-full border border-border/20 animate-spin-slow" />
      <div className="absolute w-[250px] h-[250px] rounded-full border border-primary/10" />
      {items.map((a, i) => {
        const angle = (i * 360) / items.length - 90;
        const rad = (angle * Math.PI) / 180;
        const x = Math.cos(rad) * 175;
        const y = Math.sin(rad) * 175;
        return (
          <button key={a.id} onClick={() => setActive(i)}
            className={`absolute w-16 h-16 rounded-full overflow-hidden border-2 transition-all duration-500 hover:scale-125 ${i === active ? "border-primary shadow-[0_0_20px_rgba(99,102,241,0.5)] scale-110" : "border-border/50 opacity-70"}`}
            style={{ transform: `translate(${x}px, ${y}px)` }}>
            {a.image_url && <img src={a.image_url} alt="" className="w-full h-full object-cover" />}
          </button>
        );
      })}
      <a href={`/${locale}/article/${main.id}`} className="relative z-10 text-center max-w-xs group">
        <span className="text-[10px] px-2.5 py-1 rounded-full bg-primary/10 text-primary">{getCat(main)}</span>
        <h3 className="font-bold text-lg mt-2 group-hover:text-primary transition-colors">{getTitle(main)}</h3>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{getSummary(main)}</p>
        <span className="text-[10px] text-muted-foreground mt-2 block">{main.source} • {getTime(main)}</span>
      </a>
    </div>
  );
}

/* ===== MAIN COMPONENT ===== */
export default function BreakingNewsSection({ articles }: Props) {
  const t = useTranslations();
  const locale = useLocale();
  const isArabic = locale === "ar";
  const [mode, setMode] = useState<DisplayMode>("newspaper");

  if (articles.length === 0) return null;

  const renderMode = () => {
    switch (mode) {
      case "carousel": return <CarouselVariant articles={articles} />;
      case "ticker": return <TickerTape articles={articles} />;
      case "hero-cards": return <HeroCards3D articles={articles} />;
      case "split-screen": return <SplitScreen articles={articles} />;
      case "bento": return <BentoGrid articles={articles} />;
      case "magazine": return <MagazineLayout articles={articles} />;
      case "marquee-featured": return <MarqueeFeatured articles={articles} />;
      case "glass-cards": return <GlassCards articles={articles} />;
      case "stacked": return <StackedCards articles={articles} />;
      case "timeline": return <TimelineHorizontal articles={articles} />;
      case "netflix": return <NetflixRow articles={articles} />;
      case "stories": return <Stories articles={articles} />;
      case "coverflow": return <Coverflow articles={articles} />;
      case "accordion": return <Accordion articles={articles} />;
      case "spotlight": return <SpotlightStage articles={articles} />;
      case "newspaper": return <NewspaperLayout articles={articles} />;
      case "mosaic": return <Mosaic articles={articles} />;
      case "orbit": return <Orbit articles={articles} />;
      case "polaroid": return <PolaroidWall articles={articles} />;
      case "filmstrip": return <FilmStrip articles={articles} />;
      case "hexgrid": return <HexGrid articles={articles} />;
      case "cube3d": return <Cube3D articles={articles} />;
      case "terminal": return <Terminal articles={articles} />;
      case "tvguide": return <TVGuide articles={articles} />;
      case "wave": return <Wave articles={articles} />;
      case "kanban": return <Kanban articles={articles} />;
      case "flipcards": return <FlipCards articles={articles} />;
      case "radial": return <RadialMenu articles={articles} />;
      case "wintiles": return <WindowsTiles articles={articles} />;
      case "carddeck": return <CardDeck articles={articles} />;
      case "scrollreveal": return <ScrollReveal articles={articles} />;
      case "neonglow": return <NeonGlow articles={articles} />;
      case "bookpages": return <BookPages articles={articles} />;
      case "ring3d": return <Ring3D articles={articles} />;
      case "typewriter": return <Typewriter articles={articles} />;
      case "dashboard": return <Dashboard articles={articles} />;
      case "splitflip": return <SplitFlip articles={articles} />;
      case "panorama": return <Panorama articles={articles} />;
    }
  };

  return (
    <section className="px-6 pb-16">
      <div className="max-w-7xl mx-auto">
        <h2 className="font-bold text-primary mb-4 text-start" style={{ fontSize: "24px" }}>
          {t("news.breakingNews")}
        </h2>

        {renderMode()}
      </div>
    </section>
  );
}
