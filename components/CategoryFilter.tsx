"use client";

import { useTranslations } from "next-intl";
import { ArticleCategory } from "@/lib/types";
import {
  Cpu,
  RefreshCw,
  Wrench,
  Bot,
  BarChart3,
  Handshake,
  FlaskConical,
} from "lucide-react";

const categoryIcons: Record<ArticleCategory, React.ReactNode> = {
  new_models: <Cpu className="w-4 h-4" />,
  model_updates: <RefreshCw className="w-4 h-4" />,
  ai_tools: <Wrench className="w-4 h-4" />,
  ai_agents: <Bot className="w-4 h-4" />,
  benchmarks: <BarChart3 className="w-4 h-4" />,
  deals: <Handshake className="w-4 h-4" />,
  research: <FlaskConical className="w-4 h-4" />,
};

const categories: (ArticleCategory | "all")[] = [
  "all",
  "new_models",
  "model_updates",
  "ai_tools",
  "ai_agents",
  "benchmarks",
  "deals",
  "research",
];

interface CategoryFilterProps {
  selected: ArticleCategory | "all";
  onSelect: (category: ArticleCategory | "all") => void;
}

export default function CategoryFilter({
  selected,
  onSelect,
}: CategoryFilterProps) {
  const t = useTranslations("categories");

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelect(cat)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors ${
            selected === cat
              ? "bg-primary text-white"
              : "bg-muted text-foreground hover:bg-border"
          }`}
        >
          {cat !== "all" && categoryIcons[cat]}
          <span>{t(cat)}</span>
        </button>
      ))}
    </div>
  );
}
