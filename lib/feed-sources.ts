import { FeedSource } from "./types";

export const feedSources: FeedSource[] = [
  // --- AI Labs (Highest Priority) ---
  {
    name: "OpenAI Blog",
    url: "https://openai.com/blog/rss/",
    category: "ai_lab",
  },
  {
    name: "OpenAI News",
    url: "https://openai.com/news/rss.xml",
    category: "ai_lab",
  },
  {
    name: "Anthropic Blog",
    url: "https://www.anthropic.com/feed.xml",
    category: "ai_lab",
  },
  {
    name: "Google AI Blog",
    url: "https://blog.google/technology/ai/rss/",
    category: "ai_lab",
  },
  {
    name: "Google DeepMind",
    url: "https://deepmind.google/blog/feed/basic/",
    category: "ai_lab",
  },
  {
    name: "Meta AI Blog",
    url: "https://ai.meta.com/blog/rss/",
    category: "ai_lab",
  },
  {
    name: "Microsoft AI Blog",
    url: "https://news.microsoft.com/source/topic/ai/feed/",
    category: "ai_lab",
  },
  {
    name: "Google Developers Blog",
    url: "https://developers.googleblog.com/feeds/posts/default/-/ai?alt=rss",
    category: "ai_lab",
  },
  {
    name: "Stability AI",
    url: "https://stability.ai/blog?format=rss",
    category: "ai_lab",
  },

  // --- Tech News (High Priority) ---
  {
    name: "TechCrunch AI",
    url: "https://techcrunch.com/category/artificial-intelligence/feed/",
    category: "tech_news",
  },
  {
    name: "VentureBeat AI",
    url: "https://venturebeat.com/category/ai/feed/",
    category: "tech_news",
  },
  {
    name: "The Verge AI",
    url: "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml",
    category: "tech_news",
  },
  {
    name: "Ars Technica",
    url: "https://feeds.arstechnica.com/arstechnica/technology-lab",
    category: "tech_news",
  },
  {
    name: "Wired AI",
    url: "https://www.wired.com/feed/tag/ai/latest/rss",
    category: "tech_news",
  },

  // --- Community & Research (Medium Priority) ---
  {
    name: "Hacker News AI",
    url: "https://hnrss.org/newest?q=AI+model+LLM",
    category: "community",
  },
  {
    name: "Reddit r/artificial",
    url: "https://www.reddit.com/r/artificial/.rss",
    category: "community",
  },
  {
    name: "Hugging Face Blog",
    url: "https://huggingface.co/blog/feed.xml",
    category: "community",
  },
  {
    name: "SiliconANGLE AI",
    url: "https://siliconangle.com/category/ai/feed",
    category: "community",
  },
  {
    name: "One Useful Thing",
    url: "https://www.oneusefulthing.org/feed",
    category: "community",
  },
];
