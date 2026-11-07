import type { SourceId } from "./sources.js";
import type { CategoryId } from "./categories.js";

export const PAGE_SIZE = 10;

export type Article = {
  id: string;
  title: string;
  summary: string;
  url: string;
  imageUrl?: string;
  publishedAt: string;
  source: SourceId;
  sourceName: string;
  author?: string;
  category?: CategoryId;
};

export type StoryImage = {
  url: string;
  caption?: string;
};

export type ArticleDetail = Article & {
  paragraphs: string[];
  images: StoryImage[];
};

export type ArticleQuery = {
  q?: string;
  from?: string;
  to?: string;
  categories: CategoryId[];
  sources: SourceId[];
  authors: string[];
  page: number;
};

export type SourceStatus = {
  id: SourceId;
  status: "ok" | "error";
  count?: number;
  message?: string;
};

export type ArticlePage = {
  articles: Article[];
  page: number;
  pageSize: number;
  sources: SourceStatus[];
  mode: "fixture" | "live";
};
