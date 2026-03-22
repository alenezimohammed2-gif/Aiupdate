"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { ProcessedArticle, ArticleCategory } from "@/lib/types";
import Header from "@/components/Header";
import CategoryFilter from "@/components/CategoryFilter";
import NewsCard, { CardEffect } from "@/components/NewsCard";
import BreakingNewsSection from "@/components/breaking-news/BreakingNewsSection";
import Footer from "@/components/Footer";
import { ChevronRight, ChevronLeft, ChevronDown } from "lucide-react";
import AnimatedLogo from "@/components/AnimatedLogo";

const ARTICLES_PER_PAGE = 12;

const HERO_VIDEOS = [
  "https://assets.mixkit.co/videos/30143/30143-720.mp4",
  "https://assets.mixkit.co/videos/30170/30170-720.mp4",
  "https://assets.mixkit.co/videos/47669/47669-720.mp4",
  "https://assets.mixkit.co/videos/30042/30042-720.mp4",
];

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
  const cardEffect: CardEffect = "pulse-shimmer";

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

  // Rotate background video
  const [videoIndex, setVideoIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setVideoIndex((prev) => (prev + 1) % HERO_VIDEOS.length);
    }, 2 * 60 * 1000); // 2 minutes
    return () => clearInterval(timer);
  }, []);

  const breakingNews = [...articles]
    .sort(
      (a, b) =>
        new Date(b.processed_at).getTime() -
        new Date(a.processed_at).getTime()
    )
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header selectedCategory={selectedCategory} onSelectCategory={handleCategoryChange} />

      {/* Hero Section with Video Background */}
      {currentPage === 1 && selectedCategory === "all" && (
        <section className="relative pt-16 pb-12 px-6 overflow-hidden min-h-[50vh] flex items-center justify-center">
          {/* Video Background */}
          <div className="absolute inset-0 z-0">
            <video
              key={videoIndex}
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover blur-[1px] scale-105 opacity-50 transition-opacity duration-1000"
            >
              <source
                src={HERO_VIDEOS[videoIndex]}
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
                ? "كل جديد في مجال الذكاء الاصطناعي"
                : "Your Daily Dose of AI News"}
            </h1>
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
                <NewsCard key={article.id} article={article} effect={cardEffect} />
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
            <>
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
              <div className="flex justify-center mt-4">
                <a
                  href={`/${locale}/archive`}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-primary/50 text-primary hover:bg-primary/10 transition-all text-sm font-medium"
                >
                  {isArabic ? "الأرشيف" : "Archive"}
                </a>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Footer with Logo */}
      <footer className="border-t border-border/20 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-3" dir="rtl">
            <AnimatedLogo size={40} className="text-primary" />
            <span className="text-2xl md:text-3xl font-bold tracking-tighter text-shine">
              AI Pulse
            </span>
          </div>
          <p className="text-xs text-muted-foreground/60 uppercase tracking-widest">
            {t("site.name")} — {t("footer.description")}
          </p>
        </div>
      </footer>
    </div>
  );
}
