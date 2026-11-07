import type { Article, ArticleQuery } from "../../shared/article.js";
import type { SourceId } from "../../shared/sources.js";

export class SourceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SourceError";
  }
}

export interface NewsSource {
  readonly id: SourceId;
  search(query: ArticleQuery, signal: AbortSignal): Promise<Article[]>;
}

export function stripHtml(value: string): string {
  return value
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .trim();
}
