import { FeedSource } from "./types";

export const feedSources: FeedSource[] = [
  // --- AI Labs (Highest Priority) ---
  {
    name: "OpenAI News",
    url: "https://openai.com/news/rss.xml",
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
    name: "Google Research",
    url: "https://research.google/blog/rss/",
    category: "ai_lab",
  },
  {
    name: "The Register AI",
    url: "https://www.theregister.com/software/ai_ml/headlines.atom",
    category: "tech_news",
  },
  {
    name: "Microsoft AI Blog",
    url: "https://www.microsoft.com/en-us/ai/blog/feed/",
    category: "ai_lab",
  },
  {
    name: "Microsoft Research",
    url: "https://www.microsoft.com/en-us/research/feed/",
    category: "ai_lab",
  },
  {
    name: "Stability AI Research",
    url: "https://stability.ai/research?format=rss",
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

  // --- AI Companies (Medium Priority) ---
  {
    name: "Nvidia AI Blog",
    url: "https://blogs.nvidia.com/feed/",
    category: "ai_lab",
  },
  {
    name: "ZDNet AI",
    url: "https://www.zdnet.com/topic/artificial-intelligence/rss.xml",
    category: "tech_news",
  },

  // --- Community & Research (Medium Priority) ---
  {
    name: "MIT Technology Review",
    url: "https://www.technologyreview.com/topic/artificial-intelligence/feed",
    category: "community",
  },
  {
    name: "IEEE Spectrum AI",
    url: "https://spectrum.ieee.org/feeds/topic/artificial-intelligence.rss",
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
];
