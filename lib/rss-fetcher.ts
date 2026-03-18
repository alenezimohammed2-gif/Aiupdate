import { feedSources } from "./feed-sources";
import { RawFeedItem } from "./types";

export async function fetchAllFeeds(): Promise<RawFeedItem[]> {
  const results = await Promise.allSettled(
    feedSources.map((source) => fetchSingleFeed(source.url, source.name))
  );

  const allItems: RawFeedItem[] = [];

  for (const result of results) {
    if (result.status === "fulfilled") {
      allItems.push(...result.value);
    } else {
      console.error("Feed fetch failed:", result.reason);
    }
  }

  // Sort by published date (newest first)
  allItems.sort((a, b) => {
    const dateA = a.published ? new Date(a.published).getTime() : 0;
    const dateB = b.published ? new Date(b.published).getTime() : 0;
    return dateB - dateA;
  });

  return allItems;
}

async function fetchSingleFeed(
  feedUrl: string,
  sourceName: string
): Promise<RawFeedItem[]> {
  try {
    const response = await fetch(feedUrl, {
      headers: {
        "User-Agent": "AI-Pulse-News-Bot/1.0",
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} for ${feedUrl}`);
    }

    const xml = await response.text();

    // Dynamic import for @rowanmanning/feed-parser (ESM module)
    const { parseFeed } = await import("@rowanmanning/feed-parser");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const feed = parseFeed(xml) as any;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (feed.items || []).map((item: any) => {
      let imageUrl: string | null = null;
      if (item.image) {
        if (typeof item.image === "string") {
          imageUrl = item.image;
        } else if (item.image?.url) {
          imageUrl = item.image.url;
        }
      }

      return {
        title: item.title || "Untitled",
        description: item.description || item.content || "",
        url: item.url || "",
        published: item.published
          ? new Date(item.published).toISOString()
          : null,
        image: imageUrl,
        source: sourceName,
      };
    });
  } catch (error) {
    console.error(`Failed to fetch feed from ${sourceName}:`, error);
    return [];
  }
}

// Subset of feeds for quick interactive testing (one per category mix)
const TEST_FEED_INDICES = [0, 3, 9, 12, 14];
// OpenAI Blog, Google AI Blog, TechCrunch AI, Ars Technica, Hacker News AI

export async function fetchTestFeeds(): Promise<RawFeedItem[]> {
  const testSources = TEST_FEED_INDICES
    .filter((i) => i < feedSources.length)
    .map((i) => feedSources[i]);

  const results = await Promise.allSettled(
    testSources.map((source) => fetchSingleFeed(source.url, source.name))
  );

  const allItems: RawFeedItem[] = [];

  for (const result of results) {
    if (result.status === "fulfilled") {
      allItems.push(...result.value);
    }
  }

  allItems.sort((a, b) => {
    const dateA = a.published ? new Date(a.published).getTime() : 0;
    const dateB = b.published ? new Date(b.published).getTime() : 0;
    return dateB - dateA;
  });

  return allItems;
}
