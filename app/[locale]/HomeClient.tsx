"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { ProcessedArticle, ArticleCategory } from "@/lib/types";
import Header from "@/components/Header";
import CategoryFilter from "@/components/CategoryFilter";
import NewsCard from "@/components/NewsCard";
import Footer from "@/components/Footer";
import { ChevronRight, ChevronLeft, ChevronDown } from "lucide-react";
import AnimatedLogo from "@/components/AnimatedLogo";

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

  const breakingNews = [...articles]
    .sort(
      (a, b) =>
        new Date(b.published_at).getTime() -
        new Date(a.published_at).getTime()
    )
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      {/* Hero Section with Video Background */}
      {currentPage === 1 && selectedCategory === "all" && (
        <section className="relative pt-24 pb-20 px-6 overflow-hidden min-h-[80vh] flex items-center justify-center">
          {/* Video Background */}
          <div className="absolute inset-0 z-0">
            <video
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover blur-[2px] scale-105 opacity-40"
            >
              <source
                src="https://assets.mixkit.co/videos/47669/47669-720.mp4"
                type="video/mp4"
              />
            </video>
            <div className="absolute inset-0 bg-background/70" />
          </div>

          {/* Content */}
          <div className="max-w-5xl mx-auto text-center relative z-10">
            <div className="flex items-center justify-center gap-5 mb-4 animate-fade-in">
              <AnimatedLogo size={60} className="text-primary" />
              <span className="text-5xl md:text-7xl font-bold tracking-tighter">
                {t("site.name")}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight leading-tight mb-4 text-shine">
              {isArabic
                ? "آخر أخبار الذكاء الاصطناعي"
                : "Latest AI News"}
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-6 animate-fade-in-delay-2">
              {isArabic
                ? "أخبار محدّثة تلقائياً كل 6 ساعات — مُلخّصة ومُترجمة بالذكاء الاصطناعي"
                : "Auto-updated every 6 hours — AI-summarized and translated"}
            </p>
            <a
              href="#news"
              className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors animate-fade-in-delay-3"
            >
              <ChevronDown className="w-10 h-10 text-primary animate-bounce" />
            </a>
          </div>
        </section>
      )}

      {/* Breaking News */}
      {breakingNews.length > 0 &&
        currentPage === 1 &&
        selectedCategory === "all" && (
          <section className="px-6 pb-16">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-sm uppercase tracking-widest text-muted-foreground mb-8 text-center">
                {t("news.breakingNews")}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {breakingNews.map((article, i) => (
                  <div
                    key={article.id}
                    className={`animate-fade-in-delay-${i + 1}`}
                  >
                    <NewsCard article={article} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

      {/* Divider */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="border-t border-border/30" />
      </div>

      {/* Main Content */}
      <section id="news" className="px-6 py-16">
        <div className="max-w-7xl mx-auto">
          {/* Category Filter */}
          <div className="mb-10">
            <CategoryFilter
              selected={selectedCategory}
              onSelect={handleCategoryChange}
            />
          </div>

          {/* Results count */}
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-8">
            {isArabic
              ? `${filteredArticles.length} خبر — صفحة ${currentPage} من ${totalPages || 1}`
              : `${filteredArticles.length} articles — Page ${currentPage} of ${totalPages || 1}`}
          </div>

          {/* News Grid */}
          {paginatedArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedArticles.map((article) => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <div className="text-center py-32">
              <p className="text-muted-foreground text-lg">
                {t("news.noNews")}
              </p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-16">
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-4 py-2.5 rounded-full border border-border/50 hover:bg-card hover:border-border transition-all disabled:opacity-20 disabled:cursor-not-allowed text-sm"
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
                    onClick={() => handlePageChange(page)}
                    className={`w-10 h-10 rounded-full text-sm font-medium transition-all ${
                      currentPage === page
                        ? "bg-primary text-white"
                        : "border border-border/50 hover:bg-card hover:border-border"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}

              <button
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-4 py-2.5 rounded-full border border-border/50 hover:bg-card hover:border-border transition-all disabled:opacity-20 disabled:cursor-not-allowed text-sm"
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
        </div>
      </section>

      {/* Big Typography Section */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-center gap-5">
          <AnimatedLogo size={70} className="text-primary" />
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-none text-shine">
            AI Pulse
          </h2>
        </div>
      </section>

      <Footer />
    </div>
  );
}
