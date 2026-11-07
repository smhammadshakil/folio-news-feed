import type { ArticlePage, ArticleQuery } from "@shared/article.ts";
import { toApiSearchParams } from "@shared/query.ts";
import type { SourceId } from "@shared/sources.ts";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export type SourceCatalogItem = {
  id: SourceId;
  name: string;
};

export async function fetchArticles(query: ArticleQuery, signal: AbortSignal): Promise<ArticlePage> {
  const response = await fetch(`/api/articles?${toApiSearchParams(query).toString()}`, { signal });
  if (!response.ok) {
    let message = "The feed did not load";
    try {
      const body = (await response.json()) as { error?: string };
      if (body.error) message = body.error;
    } catch {
      // Keep the fallback message when the body is not JSON.
    }
    throw new ApiError(response.status, message);
  }
  return response.json() as Promise<ArticlePage>;
}

export async function fetchSources(signal: AbortSignal): Promise<SourceCatalogItem[]> {
  const response = await fetch("/api/sources", { signal });
  if (!response.ok) throw new ApiError(response.status, "Sources did not load");
  return response.json() as Promise<SourceCatalogItem[]>;
}
