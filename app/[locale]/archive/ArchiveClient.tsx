"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { ProcessedArticle, ArticleCategory } from "@/lib/types";
import Header from "@/components/Header";
import CategoryFilter from "@/components/CategoryFilter";
import NewsCard from "@/components/NewsCard";
import Footer from "@/components/Footer";
import { Archive, ChevronRight, ChevronLeft } from "lucide-react";

const ARTICLES_PER_PAGE = 12;

interface ArchiveClientProps {
  articles: ProcessedArticle[];
}

export default function ArchiveClient({ articles }: ArchiveClientProps) {
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

  const totalPages = Math.ceil(filteredArticles.length / ARTICLES_PER_PAGE);
  const startIndex = (currentPage - 1) * ARTICLES_PER_PAGE;
  const paginatedArticles = filteredArticles.slice(
    startIndex,
    startIndex + ARTICLES_PER_PAGE
  );

  const handleCategoryChange = (category: ArticleCategory | "all") => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Archive Header */}
        <section className="pt-24 pb-10 px-6">
          <div className="max-w-7xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Archive className="w-8 h-8 text-primary" />
              <h1 className="font-bold" style={{ fontSize: "clamp(28px, 4vw, 40px)" }}>
                {isArabic ? "الأرشيف" : "Archive"}
              </h1>
            </div>
            <p className="text-muted-foreground" style={{ fontSize: "clamp(14px, 2vw, 18px)" }}>
              {isArabic
                ? "الأخبار التي تم تغطيتها خلال الفترة الماضية"
                : "Past news older than 3 days"}
            </p>
            <a
              href={`/${locale}`}
              className="inline-flex items-center gap-1 text-primary hover:text-primary-hover transition-colors mt-3 text-sm"
            >
              {isArabic ? (
                <>
                  <ChevronRight className="w-4 h-4" />
                  {"العودة للصفحة الرئيسية"}
                </>
              ) : (
                <>
                  <ChevronLeft className="w-4 h-4" />
                  {"Back to homepage"}
                </>
              )}
            </a>
          </div>
        </section>

        {/* Category Filter */}
        <section className="px-6 pb-8">
          <div className="max-w-7xl mx-auto">
            <CategoryFilter
              selected={selectedCategory}
              onSelect={handleCategoryChange}
            />
          </div>
        </section>

        {/* Results count */}
        <section className="px-6 pb-4">
          <div className="max-w-7xl mx-auto text-end">
            <span className="text-sm text-muted-foreground">
              {isArabic
                ? `${filteredArticles.length} خبر — صفحة ${currentPage} من ${totalPages || 1}`
                : `${filteredArticles.length} articles — Page ${currentPage} of ${totalPages || 1}`}
            </span>
          </div>
        </section>

        {/* Articles Grid */}
        <section className="px-6 pb-16">
          <div className="max-w-7xl mx-auto">
            {paginatedArticles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedArticles.map((article) => (
                  <NewsCard key={article.id} article={article} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <Archive className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {isArabic
                    ? "لا توجد أخبار في الأرشيف حالياً"
                    : "No archived articles at the moment"}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Pagination */}
        {totalPages > 1 && (
          <section className="px-6 pb-16">
            <div className="max-w-7xl mx-auto flex justify-center items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 rounded-lg border border-border/50 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
              >
                {isArabic ? (
                  <ChevronRight className="w-4 h-4" />
                ) : (
                  <ChevronLeft className="w-4 h-4" />
                )}
              </button>

              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-9 h-9 rounded-lg text-sm transition-colors ${
                      currentPage === page
                        ? "bg-primary text-white"
                        : "border border-border/50 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 rounded-lg border border-border/50 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
              >
                {isArabic ? (
                  <ChevronLeft className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
