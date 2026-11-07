import { PAGE_SIZE, type Article, type ArticleDetail, type ArticleQuery } from "../../shared/article.js";
import { categoryLabel, newsApiCategory, type CategoryId } from "../../shared/categories.js";
import { httpUrl } from "../../shared/url.js";
import { mapHttpError, mapThrown } from "./http.js";
import { plainParagraphs, uniqueImages } from "./prose.js";
import { SourceError, type NewsSource } from "./types.js";

type NewsApiArticle = {
  title?: string | null;
  description?: string | null;
  url?: string | null;
  urlToImage?: string | null;
  publishedAt?: string | null;
  author?: string | null;
  content?: string | null;
  source?: { name?: string | null };
};

const remembered = new Map<string, { expires: number; detail: ArticleDetail }>();

export function recallNewsApiStory(id: string): ArticleDetail | undefined {
  const hit = remembered.get(id);
  if (!hit || hit.expires <= Date.now()) {
    remembered.delete(id);
    return undefined;
  }
  return hit.detail;
}

export function rememberNewsApiStory(detail: ArticleDetail): void {
  if (!remembered.has(detail.id) && remembered.size >= 200) {
    const oldest = remembered.keys().next().value;
    if (oldest) remembered.delete(oldest);
  }
  remembered.set(detail.id, { expires: Date.now() + 10 * 60_000, detail });
}

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
      const articles = mapNewsApi(payload.articles ?? [], headlineCategory ? single : undefined);
      for (const raw of payload.articles ?? []) {
        const pageUrl = httpUrl(raw.url);
        const article = articles.find((item) => item.url === pageUrl);
        if (!article) continue;
        const image = httpUrl(raw.urlToImage);
        rememberNewsApiStory({
          ...article,
          paragraphs: plainParagraphs(raw.description ?? undefined, raw.content ?? undefined),
          images: uniqueImages(image ? [{ url: image }] : []),
        });
      }
      return articles;
    } catch (error) {
      mapThrown("NewsAPI", error);
    }
  }
}
