"use client";

import { useTranslations } from "next-intl";
import { ArticleCategory } from "@/lib/types";

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
    <div className="flex flex-wrap gap-2 justify-center">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelect(cat)}
          className={`px-4 py-2 rounded-full text-sm transition-all duration-200 ${
            selected === cat
              ? "bg-primary text-white"
              : "border border-border/50 text-muted-foreground hover:text-foreground hover:border-border"
          }`}
        >
          {t(cat)}
        </button>
      ))}
    </div>
  );
}
