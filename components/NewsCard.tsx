"use client";

import { useLocale, useTranslations } from "next-intl";
import { ProcessedArticle } from "@/lib/types";
import { Clock } from "lucide-react";
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
  const summary = isArabic ? article.summary_ar : article.summary_en;
  const categoryLabel = t(`categories.${article.category}`);

  const timeAgo = formatDistanceToNow(new Date(article.published_at), {
    addSuffix: true,
    locale: isArabic ? ar : enUS,
  });

  return (
    <a
      href={`/${locale}/article/${article.id}`}
      className="block border border-border rounded-lg bg-card hover:bg-card-hover transition-colors overflow-hidden"
    >
      {article.image_url && (
        <div className="aspect-video overflow-hidden">
          <img
            src={article.image_url}
            alt={title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}

      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
            {categoryLabel}
          </span>
          <span className="text-xs text-muted-foreground">{article.source}</span>
        </div>

        <h3 className="font-semibold text-base mb-2">{title}</h3>

        <p className="text-sm text-muted-foreground mb-3">{summary}</p>

        {article.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {article.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{timeAgo}</span>
          </div>

          <span className="text-xs text-primary font-medium">
            {isArabic ? "اقرأ المزيد ←" : "Read more →"}
          </span>
        </div>
      </div>
    </a>
  );
}
