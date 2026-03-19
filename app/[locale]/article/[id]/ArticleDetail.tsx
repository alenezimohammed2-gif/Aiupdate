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
  const categoryLabel = t(`categories.${article.category}`);

  const timeAgo = formatDistanceToNow(new Date(article.processed_at), {
    addSuffix: true,
    locale: isArabic ? ar : enUS,
  });

  const fullDate = format(new Date(article.processed_at), "PPP", {
    locale: isArabic ? ar : enUS,
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main className="pt-24 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          {/* Back link */}
          <a
            href={`/${locale}`}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-10"
          >
            <ArrowRight
              className={`w-4 h-4 ${isArabic ? "" : "rotate-180"}`}
            />
            {isArabic ? "العودة للرئيسية" : "Back to Home"}
          </a>

          {/* Category & Meta */}
          <div className="flex items-center gap-3 mb-6">
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

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold mb-8 leading-relaxed tracking-tight">
            {title}
          </h1>

          {/* Image */}
          {article.image_url && (
            <div className="rounded-2xl overflow-hidden mb-10">
              <img
                src={article.image_url}
                alt={title}
                className="w-full object-cover"
              />
            </div>
          )}

          {/* Article content */}
          <div className="mb-12">
            <div className="text-base md:text-lg leading-loose text-foreground/85 whitespace-pre-line">
              {detail}
            </div>
          </div>

          {/* Tags */}
          {article.tags.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <Tag className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs uppercase tracking-wider text-muted-foreground">
                  {isArabic ? "كلمات مفتاحية" : "Tags"}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-sm px-3 py-1.5 rounded-full border border-border/50 text-muted-foreground"
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
            <div className="border-t border-border/30 pt-6 mb-8 flex flex-wrap gap-6">
              {article.mentioned_models.length > 0 && (
                <div>
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">
                    {isArabic ? "النماذج" : "Models"}
                  </span>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {article.mentioned_models.map((m) => (
                      <span
                        key={m}
                        className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {article.mentioned_companies.length > 0 && (
                <div>
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">
                    {isArabic ? "الشركات" : "Companies"}
                  </span>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {article.mentioned_companies.map((c) => (
                      <span
                        key={c}
                        className="text-xs px-2.5 py-1 rounded-full bg-accent/10 text-accent"
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
          <div className="border-t border-border/30 pt-6 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{fullDate}</span>
            <a
              href={article.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-white hover:bg-primary-hover transition-colors text-sm"
            >
              {isArabic ? "المقال الأصلي" : "Original Article"}
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
