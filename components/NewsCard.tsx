"use client";

import { useLocale, useTranslations } from "next-intl";
import { ProcessedArticle } from "@/lib/types";
import { Clock, ArrowUpRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar, enUS } from "date-fns/locale";

interface NewsCardProps {
  article: ProcessedArticle;
}

export default function NewsCard({ article }: NewsCardProps) {
  const locale = useLocale();
  const t = useTranslations();
  const isArabic = locale === "ar";

  const title = isArabic ? article.title_ar : article.title_en;
  const fullSummary = isArabic ? article.summary_ar : article.summary_en;
  const summary = fullSummary.split(/[.،。!]/)[0] + ".";
  const categoryLabel = t(`categories.${article.category}`);

  const timeAgo = formatDistanceToNow(new Date(article.published_at), {
    addSuffix: true,
    locale: isArabic ? ar : enUS,
  });

  return (
    <a
      href={`/${locale}/article/${article.id}`}
      className="group block rounded-2xl bg-card border border-border/30 hover:border-border/60 transition-all duration-300 overflow-hidden"
    >
      {article.image_url && (
        <div className="aspect-video overflow-hidden">
          <img
            src={article.image_url}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </div>
      )}

      <div className="p-5">
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
