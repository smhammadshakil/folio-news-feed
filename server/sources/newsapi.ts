import { PAGE_SIZE, type Article, type ArticleQuery } from "../../shared/article.js";
import { categoryLabel, newsApiCategory, type CategoryId } from "../../shared/categories.js";
import { httpUrl } from "../../shared/url.js";
import { mapHttpError, mapThrown } from "./http.js";
import { SourceError, type NewsSource } from "./types.js";

type NewsApiArticle = {
  title?: string | null;
  description?: string | null;
  url?: string | null;
  urlToImage?: string | null;
  publishedAt?: string | null;
  author?: string | null;
  source?: { name?: string | null };
};

export function mapNewsApi(articles: NewsApiArticle[], forcedCategory?: CategoryId): Article[] {
  const mapped: Article[] = [];
  for (const article of articles) {
    const url = httpUrl(article.url);
    if (!article.title || article.title === "[Removed]" || !url) continue;
    mapped.push({
      id: `newsapi:${url}`,
      title: article.title,
      summary: article.description ?? "",
      url,
      imageUrl: httpUrl(article.urlToImage),
      publishedAt: article.publishedAt ?? "",
      source: "newsapi",
      sourceName: article.source?.name?.trim() || "NewsAPI",
      author: article.author?.trim() || undefined,
      category: forcedCategory,
    });
  }
  return mapped;
}

export class NewsApiSource implements NewsSource {
  readonly id = "newsapi" as const;

  constructor(private readonly apiKey: string) {}

  async search(query: ArticleQuery, signal: AbortSignal): Promise<Article[]> {
    if (!this.apiKey) throw new SourceError("NewsAPI API key is not set");
    const single = query.categories.length === 1 ? query.categories[0] : undefined;
    const headlineCategory = !query.q && single ? newsApiCategory(single) : undefined;
    const url = new URL(
      headlineCategory ? "https://newsapi.org/v2/top-headlines" : "https://newsapi.org/v2/everything",
    );
    url.searchParams.set("pageSize", String(PAGE_SIZE));
    url.searchParams.set("page", String(query.page));
    if (headlineCategory) {
      url.searchParams.set("category", headlineCategory);
      url.searchParams.set("country", "us");
    } else {
      url.searchParams.set("language", "en");
      url.searchParams.set("sortBy", "publishedAt");
      const q =
        query.q ||
        (query.categories.length > 0
          ? query.categories.map((category) => categoryLabel(category)).join(" OR ")
          : "news");
      url.searchParams.set("q", q);
      if (query.from) url.searchParams.set("from", query.from);
      if (query.to) url.searchParams.set("to", query.to);
    }
    try {
      const response = await fetch(url, { signal, headers: { "X-Api-Key": this.apiKey } });
      if (!response.ok) throw mapHttpError("NewsAPI", response.status);
      const payload = (await response.json()) as { articles?: NewsApiArticle[] };
      return mapNewsApi(payload.articles ?? [], headlineCategory ? single : undefined);
    } catch (error) {
      mapThrown("NewsAPI", error);
    }
  }
}
