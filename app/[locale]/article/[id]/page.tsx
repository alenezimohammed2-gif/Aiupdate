import { getSupabase } from "@/lib/supabase";
import { ProcessedArticle } from "@/lib/types";
import ArticleDetail from "./ArticleDetail";
import { notFound } from "next/navigation";

export const revalidate = 21600;

async function getArticle(id: string): Promise<ProcessedArticle | null> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) return null;
    return data as ProcessedArticle;
  } catch {
    return null;
  }
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id } = await params;
  const article = await getArticle(id);

  if (!article) {
    notFound();
  }

  return <ArticleDetail article={article} />;
}
