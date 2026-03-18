"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { ProcessedArticle, ArticleCategory } from "@/lib/types";
import Header from "@/components/Header";
import CategoryFilter from "@/components/CategoryFilter";
import NewsCard from "@/components/NewsCard";
import Footer from "@/components/Footer";
import { Newspaper, ChevronRight, ChevronLeft } from "lucide-react";

const ARTICLES_PER_PAGE = 12;

interface HomeClientProps {
  articles: ProcessedArticle[];
}

export default function HomeClient({ articles }: HomeClientProps) {
  const t = useTranslations();
  const locale = useLocale();
  const isArabic = locale === "ar";
  const [selectedCategory, setSelectedCategory] = useState<
    ArticleCategory | "all"
  >("all");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredArticles =
    selectedCategory === "all"
      ? articles
      : articles.filter((a) => a.category === selectedCategory);

  // Pagination
  const totalPages = Math.ceil(filteredArticles.length / ARTICLES_PER_PAGE);
  const startIndex = (currentPage - 1) * ARTICLES_PER_PAGE;
  const paginatedArticles = filteredArticles.slice(
    startIndex,
    startIndex + ARTICLES_PER_PAGE
  );

  // Reset to page 1 when category changes
  const handleCategoryChange = (category: ArticleCategory | "all") => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  // Top 3 most recent articles for "breaking news"
  const breakingNews = [...articles]
    .sort(
      (a, b) =>
        new Date(b.published_at).getTime() -
        new Date(a.published_at).getTime()
    )
    .slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-6 w-full">
        {/* Breaking News */}
        {breakingNews.length > 0 && currentPage === 1 && selectedCategory === "all" && (
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
            onSelect={handleCategoryChange}
          />
        </section>

        {/* Results count */}
        <div className="text-sm text-muted-foreground mb-4">
          {isArabic
            ? `${filteredArticles.length} خبر — صفحة ${currentPage} من ${totalPages || 1}`
            : `${filteredArticles.length} articles — Page ${currentPage} of ${totalPages || 1}`}
        </div>

        {/* News Grid */}
        {paginatedArticles.length > 0 ? (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedArticles.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </section>
        ) : (
          <div className="text-center py-20">
            <Newspaper className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">
              {t("news.noNews")}
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-sm"
            >
              {isArabic ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
              {isArabic ? "السابق" : "Previous"}
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === page
                      ? "bg-primary text-white"
                      : "border border-border hover:bg-muted"
                  }`}
                >
                  {page}
                </button>
              )
            )}

            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPages, p + 1))
              }
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-sm"
            >
              {isArabic ? "التالي" : "Next"}
              {isArabic ? (
                <ChevronLeft className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
