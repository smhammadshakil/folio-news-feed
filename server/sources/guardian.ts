import { PAGE_SIZE, type Article, type ArticleQuery } from "../../shared/article.js";
import {
  categoryFromGuardianSection,
  guardianSection,
  type CategoryId,
} from "../../shared/categories.js";
import { httpUrl } from "../../shared/url.js";
import { mapHttpError, mapThrown } from "./http.js";
import { SourceError, stripHtml, type NewsSource } from "./types.js";

type GuardianResult = {
  id?: string;
  webTitle?: string;
  webUrl?: string;
  webPublicationDate?: string;
  sectionId?: string;
  fields?: { trailText?: string; thumbnail?: string; byline?: string };
};

export function mapGuardian(results: GuardianResult[]): Article[] {
  const articles: Article[] = [];
  for (const result of results) {
    const url = httpUrl(result.webUrl);
    if (!result.id || !result.webTitle || !url) continue;
    const category = result.sectionId ? categoryFromGuardianSection(result.sectionId) : undefined;
    articles.push({
      id: `guardian:${result.id}`,
      title: stripHtml(result.webTitle),
      summary: result.fields?.trailText ? stripHtml(result.fields.trailText) : "",
      url,
      imageUrl: httpUrl(result.fields?.thumbnail),
      publishedAt: result.webPublicationDate ?? "",
      source: "guardian",
      sourceName: "The Guardian",
      author: result.fields?.byline?.trim() || undefined,
      category,
    });
  }
  return articles;
}

export class GuardianSource implements NewsSource {
  readonly id = "guardian" as const;

  constructor(private readonly apiKey: string) {}

  async search(query: ArticleQuery, signal: AbortSignal): Promise<Article[]> {
    if (!this.apiKey) throw new SourceError("Guardian API key is not set");
    const url = new URL("https://content.guardianapis.com/search");
    url.searchParams.set("api-key", this.apiKey);
    url.searchParams.set("page-size", String(PAGE_SIZE));
    url.searchParams.set("page", String(query.page));
    url.searchParams.set("order-by", "newest");
    url.searchParams.set("show-fields", "trailText,thumbnail,byline");
    if (query.q) url.searchParams.set("q", query.q);
    if (query.from) url.searchParams.set("from-date", query.from);
    if (query.to) url.searchParams.set("to-date", query.to);
    if (query.categories.length === 1) {
      url.searchParams.set("section", guardianSection(query.categories[0] as CategoryId));
    }
    try {
      const response = await fetch(url, { signal });
      if (!response.ok) throw mapHttpError("Guardian", response.status);
      const payload = (await response.json()) as { response?: { results?: GuardianResult[] } };
      return mapGuardian(payload.response?.results ?? []);
    } catch (error) {
      mapThrown("Guardian", error);
    }
  }
}
