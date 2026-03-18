"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ProcessedArticle, ArticleCategory } from "@/lib/types";
import Header from "@/components/Header";
import CategoryFilter from "@/components/CategoryFilter";
import NewsCard from "@/components/NewsCard";
import Footer from "@/components/Footer";
import { Newspaper } from "lucide-react";

interface HomeClientProps {
  articles: ProcessedArticle[];
}

export default function HomeClient({ articles }: HomeClientProps) {
  const t = useTranslations();
  const [selectedCategory, setSelectedCategory] = useState<
    ArticleCategory | "all"
  >("all");

  const filteredArticles =
    selectedCategory === "all"
      ? articles
      : articles.filter((a) => a.category === selectedCategory);

  // Top 3 most recent articles for "breaking news"
  const breakingNews = [...articles]
    .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
    .slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-6 w-full">
        {/* Breaking News */}
        {breakingNews.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Newspaper className="w-5 h-5 text-primary" />
              {t("news.breakingNews")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {breakingNews.map((article) => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>
          </section>
        )}

        {/* Category Filter */}
        <section className="mb-6">
          <CategoryFilter
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />
        </section>

        {/* News Grid */}
        {filteredArticles.length > 0 ? (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredArticles.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </section>
        ) : (
          <div className="text-center py-20">
            <Newspaper className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">{t("news.noNews")}</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
