"use client";

import { useLocale, useTranslations } from "next-intl";
import { ProcessedArticle } from "@/lib/types";
import { Clock, ArrowUpRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import { useRef } from "react";

export type CardEffect =
  | "none"
  | "lift"
  | "shimmer"
  | "glow-border"
  | "gradient-border"
  | "tilt-3d"
  | "spotlight"
  | "pulse"
  | "image-parallax"
  | "ripple"
  | "pulse-shimmer";

const EFFECT_CLASSES: Record<CardEffect, string> = {
  none: "hover:border-border/60",
  lift: "hover:border-primary/40 hover:-translate-y-2 hover:shadow-[0_8px_30px_rgba(124,58,237,0.15)] hover:scale-[1.02]",
  shimmer: "hover:border-border/60 card-shimmer",
  "glow-border": "hover:border-primary/60 hover:shadow-[0_0_20px_rgba(124,58,237,0.3),inset_0_0_20px_rgba(124,58,237,0.05)]",
  "gradient-border": "gradient-border-card",
  "tilt-3d": "hover:border-border/60 tilt-3d-card",
  spotlight: "hover:border-border/60 spotlight-card",
  pulse: "hover:border-primary/40 hover:animate-card-pulse",
  "image-parallax": "hover:border-border/60",
  ripple: "hover:border-primary/40 hover:-translate-y-1",
  "pulse-shimmer": "hover:border-primary/40 hover:animate-card-pulse card-shimmer",
};

interface NewsCardProps {
  article: ProcessedArticle;
  effect?: CardEffect;
}

export default function NewsCard({ article, effect = "lift" }: NewsCardProps) {
  const locale = useLocale();
  const t = useTranslations();
  const isArabic = locale === "ar";
  const cardRef = useRef<HTMLAnchorElement>(null);

  const title = isArabic ? article.title_ar : article.title_en;
  const fullSummary = isArabic ? article.summary_ar : article.summary_en;
  const summary = fullSummary.split(/[.،。!]/)[0] + ".";
  const categoryLabel = t(`categories.${article.category}`);

  const timeAgo = formatDistanceToNow(new Date(article.processed_at), {
    addSuffix: true,
    locale: isArabic ? ar : enUS,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (effect === "tilt-3d") {
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = (y - centerY) / 15;
      const rotateY = (centerX - x) / 15;
      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    }

    if (effect === "spotlight") {
      card.style.setProperty("--spot-x", `${x}px`);
      card.style.setProperty("--spot-y", `${y}px`);
    }

    if (effect === "image-parallax") {
      const img = card.querySelector("img");
      if (img) {
        const moveX = (x - rect.width / 2) / 20;
        const moveY = (y - rect.height / 2) / 20;
        img.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.08)`;
      }
    }
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;

    if (effect === "tilt-3d") {
      card.style.transform = "";
    }
    if (effect === "image-parallax") {
      const img = card.querySelector("img");
      if (img) img.style.transform = "";
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (effect === "ripple") {
      const card = cardRef.current;
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const ripple = document.createElement("span");
      ripple.className = "ripple-effect";
      ripple.style.left = `${e.clientX - rect.left}px`;
      ripple.style.top = `${e.clientY - rect.top}px`;
      card.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    }
  };

  return (
    <a
      ref={cardRef}
      href={`/${locale}/article/${article.id}`}
      className={`group block rounded-2xl bg-card border border-border/30 transition-all duration-300 overflow-hidden relative ${EFFECT_CLASSES[effect]}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      style={effect === "tilt-3d" ? { transformStyle: "preserve-3d", transition: "transform 0.15s ease" } : undefined}
    >
      {/* Shimmer overlay */}
      {(effect === "shimmer" || effect === "pulse-shimmer") && (
        <div className="absolute inset-0 z-20 pointer-events-none shimmer-overlay" />
      )}

      {/* Spotlight overlay */}
      {effect === "spotlight" && (
        <div
          className="absolute inset-0 z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: "radial-gradient(300px circle at var(--spot-x, 50%) var(--spot-y, 50%), rgba(124,58,237,0.12), transparent 60%)",
          }}
        />
      )}

      {/* Gradient border overlay */}
      {effect === "gradient-border" && (
        <div className="absolute inset-0 z-20 pointer-events-none rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 gradient-border-overlay" />
      )}

      {article.image_url && (
        <div className="aspect-video overflow-hidden">
          <img
            src={article.image_url}
            alt={title}
            className={`w-full h-full object-cover transition-transform duration-500 ${
              effect === "image-parallax" ? "" : "group-hover:scale-105"
            }`}
            loading="lazy"
          />
        </div>
      )}

      <div className="p-5 relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[11px] uppercase tracking-wider px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">
            {categoryLabel}
          </span>
          <span className="text-[11px] text-muted-foreground">{article.source}</span>
        </div>

        <h3 className="font-semibold text-base mb-2.5 leading-relaxed group-hover:text-primary transition-colors">
          {title}
        </h3>

        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          {summary}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{timeAgo}</span>
          </div>

          <span className="flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            {isArabic ? "اقرأ المزيد" : "Read more"}
            <ArrowUpRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </a>
  );
}
