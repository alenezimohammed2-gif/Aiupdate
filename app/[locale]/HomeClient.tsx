"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { ProcessedArticle, ArticleCategory } from "@/lib/types";
import Header from "@/components/Header";
import CategoryFilter from "@/components/CategoryFilter";
import NewsCard from "@/components/NewsCard";
import BreakingNewsSection from "@/components/breaking-news/BreakingNewsSection";
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
        new Date(b.processed_at).getTime() -
        new Date(a.processed_at).getTime()
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
            <div className="flex items-center justify-center gap-5 mb-4 animate-fade-in" dir="rtl">
              <AnimatedLogo size={60} className="text-primary" />
              <span className="font-sans font-bold tracking-tighter" style={{ fontSize: "clamp(48px, 8vw, 80px)" }}>
                {t("site.name")}
              </span>
            </div>
            <h1 className="font-bold tracking-tight leading-tight mb-4 text-shine" style={{ fontSize: "clamp(22px, 3vw, 36px)" }}>
              {isArabic
                ? "آخر الأخبار والتحديثات في مجال الذكاء الاصطناعي"
                : "Latest News & Updates in Artificial Intelligence"}
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-6 animate-fade-in-delay-2" style={{ fontSize: "clamp(14px, 2vw, 18px)" }}>
              {isArabic
                ? "أخبار يومية مترجمة وملخصة تبقيك على اطلاع لكل ماهو جديد في هذا المجال!"
                : "Daily translated and summarized news to keep you up to date with everything new in this field!"}
            </p>
            <div className="animate-fade-in-delay-3">
              <a
                href="#news"
                className="inline-flex flex-col items-center text-primary hover:text-primary-hover transition-colors animate-bounce"
              >
                <span className="font-medium mb-1" style={{ fontSize: "14px" }}>
                  {isArabic ? "استعراض الأخبار حسب التصنيف" : "Browse news by category"}
                </span>
                <ChevronDown className="w-10 h-10" />
              </a>
            </div>
          </div>
        </section>
      )}

      {/* Breaking News */}
      {breakingNews.length > 0 &&
        currentPage === 1 &&
        selectedCategory === "all" && (
          <BreakingNewsSection articles={breakingNews} />
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
