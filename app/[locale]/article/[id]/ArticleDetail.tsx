"use client";

import { useLocale, useTranslations } from "next-intl";
import { ProcessedArticle } from "@/lib/types";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ExternalLink, Clock, ArrowRight, Tag } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { ar, enUS } from "date-fns/locale";

interface ArticleDetailProps {
  article: ProcessedArticle;
}

export default function ArticleDetail({ article }: ArticleDetailProps) {
  const locale = useLocale();
  const t = useTranslations();
  const isArabic = locale === "ar";

  const title = isArabic ? article.title_ar : article.title_en;
  const detail = isArabic
    ? article.detail_ar || article.summary_ar
    : article.detail_en || article.summary_en;
  const summary = isArabic ? article.summary_ar : article.summary_en;
  const categoryLabel = t(`categories.${article.category}`);

  const timeAgo = formatDistanceToNow(new Date(article.published_at), {
    addSuffix: true,
    locale: isArabic ? ar : enUS,
  });

  const fullDate = format(new Date(article.published_at), "PPP", {
    locale: isArabic ? ar : enUS,
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-3xl mx-auto px-4 py-8 w-full">
        {/* Back link */}
        <a
          href={`/${locale}`}
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline mb-6"
        >
          <ArrowRight className={`w-4 h-4 ${isArabic ? "" : "rotate-180"}`} />
          {isArabic ? "العودة للرئيسية" : "Back to Home"}
        </a>

        {/* Category & Source */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">
            {categoryLabel}
          </span>
          <span className="text-sm text-muted-foreground">{article.source}</span>
          <span className="text-sm text-muted-foreground">•</span>
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {timeAgo}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold mb-4 leading-relaxed">{title}</h1>

        {/* Image */}
        {article.image_url && (
          <div className="rounded-lg overflow-hidden mb-6">
            <img
              src={article.image_url}
              alt={title}
              className="w-full object-cover"
            />
          </div>
        )}

        {/* Article content */}
        <div className="mb-8">
          <div className="text-base leading-relaxed whitespace-pre-line">
            {detail}
          </div>
        </div>

        {/* Tags */}
        {article.tags.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Tag className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                {isArabic ? "كلمات مفتاحية" : "Tags"}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-sm px-3 py-1 rounded-full bg-muted text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Mentioned models & companies */}
        {(article.mentioned_models.length > 0 ||
          article.mentioned_companies.length > 0) && (
          <div className="border-t border-border pt-4 mb-6 flex flex-wrap gap-4">
            {article.mentioned_models.length > 0 && (
              <div>
                <span className="text-xs text-muted-foreground">
                  {isArabic ? "النماذج المذكورة:" : "Models:"}
                </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {article.mentioned_models.map((m) => (
                    <span
                      key={m}
                      className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {article.mentioned_companies.length > 0 && (
              <div>
                <span className="text-xs text-muted-foreground">
                  {isArabic ? "الشركات المذكورة:" : "Companies:"}
                </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {article.mentioned_companies.map((c) => (
                    <span
                      key={c}
                      className="text-xs px-2 py-0.5 rounded bg-green-50 text-green-700"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Date & Read original */}
        <div className="border-t border-border pt-4 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{fullDate}</span>
          <a
            href={article.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors text-sm"
          >
            {isArabic ? "اقرأ المقال الأصلي" : "Read Original Article"}
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </main>

      <Footer />
    </div>
  );
}
