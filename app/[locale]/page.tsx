import { getSupabase } from "@/lib/supabase";
import { ProcessedArticle } from "@/lib/types";
import HomeClient from "./HomeClient";

export const revalidate = 21600; // ISR: revalidate every 6 hours

async function getArticles(): Promise<ProcessedArticle[]> {
  try {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .order("processed_at", { ascending: false })
      .limit(100);

    if (error) {
      console.error("Failed to fetch articles:", error);
      return [];
    }

    return (data as ProcessedArticle[]) || [];
  } catch {
    // During build time, env vars may not be available
    return [];
  }
}

export default async function HomePage() {
  const articles = await getArticles();

  return <HomeClient articles={articles} />;
}
