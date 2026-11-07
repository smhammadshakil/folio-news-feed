import { PAGE_SIZE, type Article, type ArticleQuery } from "../../shared/article.js";
import { categoryFromNytDesk, nytNewsDeskFilter } from "../../shared/categories.js";
import { httpUrl } from "../../shared/url.js";
import { mapHttpError, mapThrown } from "./http.js";
import { SourceError, type NewsSource } from "./types.js";

type NytDoc = {
  _id?: string;
  web_url?: string;
  headline?: { main?: string };
  abstract?: string;
  snippet?: string;
  pub_date?: string;
  news_desk?: string;
  byline?: { original?: string };
  multimedia?: { type?: string; url?: string; legacy?: { xlarge?: string } }[];
};

const cache = new Map<string, { expires: number; docs: NytDoc[] }>();

export function clearNytCache(): void {
  cache.clear();
}

export function nytImage(multimedia: NytDoc["multimedia"]): string | undefined {
  if (!Array.isArray(multimedia)) return undefined;
  const image = multimedia.find((item) => item.type === "image" || Boolean(item.url));
  const raw = image?.url ?? image?.legacy?.xlarge;
  if (!raw) return undefined;
  if (raw.startsWith("http")) return raw;
  return `https://static01.nyt.com/${raw.replace(/^\//, "")}`;
}

export function mapNyt(docs: NytDoc[]): Article[] {
  const articles: Article[] = [];
  for (const doc of docs) {
    const url = httpUrl(doc.web_url);
    if (!doc._id || !doc.headline?.main || !url) continue;
    const byline = doc.byline?.original?.replace(/^By\s+/i, "").trim();
    articles.push({
      id: `nyt:${doc._id}`,
      title: doc.headline.main,
      summary: doc.abstract || doc.snippet || "",
      url,
      imageUrl: httpUrl(nytImage(doc.multimedia)),
      publishedAt: doc.pub_date ?? "",
      source: "nyt",
      sourceName: "The New York Times",
      author: byline || undefined,
      category: categoryFromNytDesk(doc.news_desk),
    });
  }
  return articles;
}

export class NytSource implements NewsSource {
  readonly id = "nyt" as const;

  constructor(private readonly apiKey: string) {}

  async search(query: ArticleQuery, signal: AbortSignal): Promise<Article[]> {
    if (!this.apiKey) throw new SourceError("New York Times API key is not set");
    const url = new URL("https://api.nytimes.com/svc/search/v2/articlesearch.json");
    url.searchParams.set("api-key", this.apiKey);
    url.searchParams.set("sort", "newest");
    url.searchParams.set("page", String(query.page - 1));
    if (query.q) url.searchParams.set("q", query.q);
    if (query.from) url.searchParams.set("begin_date", query.from.replaceAll("-", ""));
    if (query.to) url.searchParams.set("end_date", query.to.replaceAll("-", ""));
    const desks = nytNewsDeskFilter(query.categories);
    if (desks) url.searchParams.set("fq", desks);

    const key = url.toString();
    const hit = cache.get(key);
    if (hit && hit.expires > Date.now()) return mapNyt(hit.docs);

    try {
      const response = await fetch(url, { signal });
      if (!response.ok) throw mapHttpError("New York Times", response.status);
      const payload = (await response.json()) as { response?: { docs?: NytDoc[] } };
      const docs = (payload.response?.docs ?? []).slice(0, PAGE_SIZE);
      cache.set(key, { expires: Date.now() + 60_000, docs });
      return mapNyt(docs);
    } catch (error) {
      mapThrown("New York Times", error);
    }
  }
}
