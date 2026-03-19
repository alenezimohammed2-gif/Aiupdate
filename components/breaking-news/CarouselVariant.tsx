"use client";

import { useState, useEffect, useCallback } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ProcessedArticle } from "@/lib/types";
import { Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar, enUS } from "date-fns/locale";

interface Props {
  articles: ProcessedArticle[];
}

export default function CarouselVariant({ articles }: Props) {
  const locale = useLocale();
  const t = useTranslations();
  const isArabic = locale === "ar";
  const [current, setCurrent] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const goNext = useCallback(() => {
    setCurrent((prev) => (prev + 1) % articles.length);
  }, [articles.length]);

  const goPrev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + articles.length) % articles.length);
  }, [articles.length]);

  // Auto-advance
  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(goNext, 5000);
    return () => clearInterval(timer);
  }, [isAutoPlaying, goNext]);

  // Resume auto-play after 10s of inactivity
  useEffect(() => {
    if (isAutoPlaying) return;
    const timer = setTimeout(() => setIsAutoPlaying(true), 10000);
    return () => clearTimeout(timer);
  }, [isAutoPlaying]);

  const handleManualNav = (action: () => void) => {
    setIsAutoPlaying(false);
    action();
  };

  if (articles.length === 0) return null;

  const translateValue = isArabic ? current * 100 : -(current * 100);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-card border border-border/30">
      {/* Slides track */}
      <div
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(${translateValue}%)` }}
      >
        {articles.map((article) => {
          const title = isArabic ? article.title_ar : article.title_en;
          const summary = isArabic ? article.summary_ar : article.summary_en;
          const categoryLabel = t(`categories.${article.category}`);
          const timeAgo = formatDistanceToNow(
            new Date(article.processed_at),
            { addSuffix: true, locale: isArabic ? ar : enUS }
          );

          return (
            <a
              key={article.id}
              href={`/${locale}/article/${article.id}`}
              className="w-full flex-shrink-0 group"
            >
              {/* Image */}
              <div className="aspect-[3/1] overflow-hidden">
                {article.image_url ? (
                  <img
                    src={article.image_url}
                    alt={title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-card" />
                )}
              </div>

              {/* Content */}
              <div className="p-4 md:p-5">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[11px] uppercase tracking-wider px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">
                    {categoryLabel}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {article.source}
                  </span>
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {timeAgo}
                  </span>
                </div>
                <h3 className="font-bold leading-snug mb-2 group-hover:text-primary transition-colors" style={{ fontSize: "18px" }}>
                  {title}
                </h3>
                <p className="text-muted-foreground leading-relaxed line-clamp-1 max-w-3xl" style={{ fontSize: "13px" }}>
                  {summary}
                </p>
              </div>
            </a>
          );
        })}
      </div>

      {/* Navigation arrows */}
      <button
        onClick={() => handleManualNav(isArabic ? goNext : goPrev)}
        className="absolute top-1/3 start-4 -translate-y-1/2 w-10 h-10 rounded-full bg-background/60 backdrop-blur-sm border border-border/30 flex items-center justify-center text-foreground hover:bg-background/80 transition-colors"
        aria-label="Previous"
      >
        {isArabic ? (
          <ChevronRight className="w-5 h-5" />
        ) : (
          <ChevronLeft className="w-5 h-5" />
        )}
      </button>
      <button
        onClick={() => handleManualNav(isArabic ? goPrev : goNext)}
        className="absolute top-1/3 end-4 -translate-y-1/2 w-10 h-10 rounded-full bg-background/60 backdrop-blur-sm border border-border/30 flex items-center justify-center text-foreground hover:bg-background/80 transition-colors"
        aria-label="Next"
      >
        {isArabic ? (
          <ChevronLeft className="w-5 h-5" />
        ) : (
          <ChevronRight className="w-5 h-5" />
        )}
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {articles.map((_, i) => (
          <button
            key={i}
            onClick={() => handleManualNav(() => setCurrent(i))}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              i === current
                ? "bg-primary w-6"
                : "bg-foreground/30 hover:bg-foreground/50"
            }`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
