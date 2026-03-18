"use client";

import { useTranslations } from "next-intl";
import { ProcessedArticle } from "@/lib/types";
import CarouselVariant from "./CarouselVariant";

interface Props {
  articles: ProcessedArticle[];
}

export default function BreakingNewsSection({ articles }: Props) {
  const t = useTranslations();

  if (articles.length === 0) return null;

  return (
    <section className="px-6 pb-16">
      <div className="max-w-7xl mx-auto">
        <h2 className="font-bold text-primary mb-6 text-start" style={{ fontSize: "24px" }}>
          {t("news.breakingNews")}
        </h2>
        <CarouselVariant articles={articles} />
      </div>
    </section>
  );
}
