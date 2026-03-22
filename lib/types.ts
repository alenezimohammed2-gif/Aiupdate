export type ArticleCategory =
  | "new_models"
  | "model_updates"
  | "ai_tools"
  | "ai_agents"
  | "benchmarks"
  | "deals"
  | "research";

export interface ProcessedArticle {
  id: string;
  title_en: string;
  title_ar: string;
  summary_en: string;
  summary_ar: string;
  detail_en: string;
  detail_ar: string;
  category: ArticleCategory;
  source: string;
  source_url: string;
  image_url: string | null;
  image_prompt: string | null;
  image_style: string | null;
  image_colors: string | null;
  published_at: string;
  processed_at: string;
  relevance_score: number;
  tags: string[];
  mentioned_models: string[];
  mentioned_companies: string[];
}

export interface RawFeedItem {
  title: string;
  description: string;
  url: string;
  published: string | null;
  image: string | null;
  source: string;
}

export interface FeedSource {
  name: string;
  url: string;
  category: "ai_lab" | "tech_news" | "community";
}

export const CATEGORY_LABELS: Record<ArticleCategory, { en: string; ar: string }> = {
  new_models: { en: "New Models", ar: "نماذج جديدة" },
  model_updates: { en: "Model Updates", ar: "تحديثات نماذج" },
  ai_tools: { en: "AI Tools", ar: "أدوات AI" },
  ai_agents: { en: "AI Agents", ar: "وكلاء AI" },
  benchmarks: { en: "Benchmarks", ar: "معايير أداء" },
  deals: { en: "Deals & Partnerships", ar: "صفقات وشراكات" },
  research: { en: "Research", ar: "أبحاث" },
};

export const CATEGORY_ICONS: Record<ArticleCategory, string> = {
  new_models: "cpu",
  model_updates: "refresh-cw",
  ai_tools: "wrench",
  ai_agents: "bot",
  benchmarks: "bar-chart-3",
  deals: "handshake",
  research: "flask-conical",
};
