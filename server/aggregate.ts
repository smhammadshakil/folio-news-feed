import { PAGE_SIZE, type Article, type ArticlePage, type ArticleQuery, type SourceStatus } from "../shared/article.js";
import type { SourceId } from "../shared/sources.js";
import { SourceError, type NewsSource } from "./sources/types.js";

const SOURCE_RANK: Record<SourceId, number> = { guardian: 0, nyt: 1, newsapi: 2 };

export async function aggregate(
  sources: NewsSource[],
  query: ArticleQuery,
  signal: AbortSignal,
  mode: ArticlePage["mode"],
): Promise<ArticlePage> {
  const settled = await Promise.all(
    sources.map(async (source) => {
      const timeout = AbortSignal.timeout(8000);
      const combined = AbortSignal.any([signal, timeout]);
      try {
        const articles = await source.search(query, combined);
        const status: SourceStatus = { id: source.id, status: "ok", count: articles.length };
        return { status, articles };
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") throw error;
        const message = error instanceof SourceError ? error.message : "This source is unavailable";
        const status: SourceStatus = { id: source.id, status: "error", message };
        return { status, articles: [] as Article[] };
      }
    }),
  );

  let articles = settled.flatMap((item) => item.articles);
  articles = dedupe(articles);
  if (query.categories.length > 0) {
    articles = articles.filter(
      (article) => article.category !== undefined && query.categories.includes(article.category),
    );
  }
  if (query.authors.length > 0) {
    const names = query.authors.map((author) => author.toLowerCase());
    articles = articles.filter((article) => {
      if (!article.author) return false;
      const byline = article.author.toLowerCase();
      return names.some((name) => byline.includes(name));
    });
  }
  articles.sort(byNewest);
  return {
    articles,
    page: query.page,
    pageSize: PAGE_SIZE,
    sources: settled.map((item) => item.status),
    mode,
  };
}

function dedupe(articles: Article[]): Article[] {
  const winners = new Map<string, Article>();
  for (const article of articles) {
    const key = dedupeKey(article);
    const current = winners.get(key);
    winners.set(key, current ? prefer(current, article) : article);
  }
  return [...winners.values()];
}

function dedupeKey(article: Article): string {
  if (article.url) {
    try {
      const url = new URL(article.url);
      const host = url.hostname.replace(/^www\./, "");
      const path = url.pathname.replace(/\/$/, "");
      return `${host}${path}`.toLowerCase();
    } catch {
      // Fall through to the title key when the URL cannot be parsed.
    }
  }
  return `title:${article.title.trim().toLowerCase()}|${article.publishedAt.slice(0, 10)}`;
}

function prefer(left: Article, right: Article): Article {
  const leftTime = Date.parse(left.publishedAt);
  const rightTime = Date.parse(right.publishedAt);
  const leftOk = !Number.isNaN(leftTime);
  const rightOk = !Number.isNaN(rightTime);
  if (leftOk && rightOk && leftTime !== rightTime) return leftTime < rightTime ? left : right;
  if (leftOk && !rightOk) return left;
  if (!leftOk && rightOk) return right;
  return SOURCE_RANK[left.source] <= SOURCE_RANK[right.source] ? left : right;
}

function byNewest(left: Article, right: Article): number {
  const leftTime = Date.parse(left.publishedAt);
  const rightTime = Date.parse(right.publishedAt);
  const leftOk = !Number.isNaN(leftTime);
  const rightOk = !Number.isNaN(rightTime);
  if (leftOk && rightOk) return rightTime - leftTime;
  if (leftOk) return -1;
  if (rightOk) return 1;
  return 0;
}
