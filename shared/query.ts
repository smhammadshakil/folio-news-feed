import { CATEGORY_IDS, isCategoryId, type CategoryId } from "./categories.js";
import type { ArticleQuery } from "./article.js";
import type { Preferences } from "./preferences.js";
import { SOURCE_IDS, isSourceId, type SourceId } from "./sources.js";

export type ParseResult = { ok: true; query: ArticleQuery } | { ok: false; error: string };

function isRealDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function readList(params: URLSearchParams, key: string): string[] {
  return params
    .getAll(key)
    .flatMap((value) => value.split(","))
    .map((value) => value.trim())
    .filter(Boolean);
}

function sameMembers(left: string[], right: string[]): boolean {
  if (left.length !== right.length) return false;
  const bag = new Set(right);
  return left.every((item) => bag.has(item));
}

export function parseArticleQuery(params: URLSearchParams): ParseResult {
  const dates = readDates(params);
  if (!dates.ok) return dates;

  let categories: CategoryId[] = [];
  if (params.has("category")) {
    const raw = readList(params, "category");
    if (!raw.includes("all")) {
      for (const value of raw) {
        if (!isCategoryId(value)) return { ok: false, error: `Unknown category: ${value}` };
      }
      categories = raw.filter(isCategoryId);
    }
  }

  let sources: SourceId[] = [...SOURCE_IDS];
  if (params.has("source")) {
    const raw = readList(params, "source");
    if (raw.length === 0 || raw.includes("all")) {
      sources = [...SOURCE_IDS];
    } else {
      for (const value of raw) {
        if (!isSourceId(value)) return { ok: false, error: `Unknown source: ${value}` };
      }
      sources = raw.filter(isSourceId);
    }
  }

  const authors = params.has("author")
    ? params
        .getAll("author")
        .map((value) => value.trim())
        .filter(Boolean)
    : [];

  const pageResult = readPage(params);
  if (!pageResult.ok) return pageResult;

  const q = params.get("q")?.trim() || undefined;
  return {
    ok: true,
    query: {
      q,
      from: dates.from,
      to: dates.to,
      categories,
      sources,
      authors,
      page: pageResult.page,
    },
  };
}

export function mergePageQuery(preferences: Preferences, params: URLSearchParams): ParseResult {
  const dates = readDates(params);
  if (!dates.ok) return dates;
  const pageResult = readPage(params);
  if (!pageResult.ok) return pageResult;

  let categories = preferences.categories;
  if (params.has("category")) {
    const raw = readList(params, "category");
    if (raw.includes("all")) {
      categories = [];
    } else {
      for (const value of raw) {
        if (!isCategoryId(value)) return { ok: false, error: `Unknown category: ${value}` };
      }
      categories = raw.filter(isCategoryId);
    }
  }

  let sources = preferences.sources;
  if (params.has("source")) {
    const raw = readList(params, "source");
    if (raw.length === 0) return { ok: false, error: "Choose at least one source" };
    for (const value of raw) {
      if (!isSourceId(value)) return { ok: false, error: `Unknown source: ${value}` };
    }
    sources = raw.filter(isSourceId);
  }

  const authors = params.has("author")
    ? params
        .getAll("author")
        .map((value) => value.trim())
        .filter(Boolean)
    : preferences.authors;

  return {
    ok: true,
    query: {
      q: params.has("q") ? params.get("q")?.trim() || undefined : undefined,
      from: dates.from,
      to: dates.to,
      categories,
      sources,
      authors,
      page: pageResult.page,
    },
  };
}

export function paramsFromEffective(query: ArticleQuery, preferences: Preferences): URLSearchParams {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.from) params.set("from", query.from);
  if (query.to) params.set("to", query.to);
  if (!sameMembers(query.categories, preferences.categories)) {
    if (query.categories.length === 0) params.append("category", "all");
    else query.categories.forEach((category) => params.append("category", category));
  }
  if (!sameMembers(query.sources, preferences.sources)) {
    query.sources.forEach((source) => params.append("source", source));
  }
  if (!sameMembers(query.authors, preferences.authors)) {
    if (query.authors.length === 0) params.set("author", "");
    else query.authors.forEach((author) => params.append("author", author));
  }
  if (query.page > 1) params.set("page", String(query.page));
  return params;
}

export function toApiSearchParams(query: ArticleQuery): URLSearchParams {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.from) params.set("from", query.from);
  if (query.to) params.set("to", query.to);
  query.categories.forEach((category) => params.append("category", category));
  query.sources.forEach((source) => params.append("source", source));
  query.authors.forEach((author) => params.append("author", author));
  params.set("page", String(query.page));
  return params;
}

function readDates(params: URLSearchParams): { ok: true; from?: string; to?: string } | { ok: false; error: string } {
  const from = params.get("from")?.trim() || undefined;
  const to = params.get("to")?.trim() || undefined;
  if (from && !isRealDate(from)) return { ok: false, error: "from must be a real date (YYYY-MM-DD)" };
  if (to && !isRealDate(to)) return { ok: false, error: "to must be a real date (YYYY-MM-DD)" };
  if (from && to && from > to) return { ok: false, error: "from must be on or before to" };
  return { ok: true, from, to };
}

function readPage(params: URLSearchParams): { ok: true; page: number } | { ok: false; error: string } {
  if (!params.has("page") || params.get("page") === "") return { ok: true, page: 1 };
  const page = Number(params.get("page"));
  if (!Number.isInteger(page) || page < 1 || page > 10) return { ok: false, error: "page must be from 1 to 10" };
  return { ok: true, page };
}

export function allCategoryIds(): CategoryId[] {
  return [...CATEGORY_IDS];
}
