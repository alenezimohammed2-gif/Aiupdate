import { getSupabase } from "@/lib/supabase";
import { ProcessedArticle } from "@/lib/types";
import ArchiveClient from "./ArchiveClient";

export const revalidate = 21600;

async function getArchivedArticles(): Promise<ProcessedArticle[]> {
  try {
    const supabase = getSupabase();

    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .lt("processed_at", threeDaysAgo.toISOString())
      .order("processed_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch archived articles:", error);
      return [];
    }

    return (data as ProcessedArticle[]) || [];
  } catch {
    return [];
  }
}

export default async function ArchivePage() {
  const articles = await getArchivedArticles();

  return <ArchiveClient articles={articles} />;
}
