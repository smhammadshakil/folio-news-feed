import { describe, expect, it } from "vitest";
import type { Article } from "../../shared/article.js";
import { filterArticles, rebaseToRecent } from "./filter.js";

const articles: Article[] = [
  {
    id: "guardian:1",
    title: "Climate desk notes",
    summary: "A sample brief on coastal storms.",
    url: "https://www.theguardian.com/environment",
    publishedAt: "2026-11-01T08:00:00.000Z",
    source: "guardian",
    sourceName: "The Guardian",
    category: "science",
  },
  {
    id: "guardian:2",
    title: "Markets open quiet",
    summary: "Trading desks reported a flat morning.",
    url: "https://www.theguardian.com/business",
    publishedAt: "2026-10-01T08:00:00.000Z",
    source: "guardian",
    sourceName: "The Guardian",
    category: "business",
  },
];

const base = { categories: [], sources: ["guardian" as const], authors: [], page: 1 };

describe("filterArticles", () => {
  it("matches a keyword in the title", () => {
    expect(filterArticles(articles, { ...base, q: "climate" })).toHaveLength(1);
  });

  it("applies an inclusive date window and category", () => {
    const found = filterArticles(articles, { ...base, from: "2026-10-15", to: "2026-11-07", categories: ["science"] });
    expect(found.map((article) => article.id)).toEqual(["guardian:1"]);
  });

  it("moves the newest sample story to the past hour", () => {
    const [newest] = rebaseToRecent(articles, Date.parse("2026-12-01T12:00:00.000Z"));
    expect(newest?.publishedAt).toBe("2026-12-01T11:00:00.000Z");
  });

  it("paginates after filtering", () => {
    const many = Array.from({ length: 12 }, (_, index) => ({
      ...articles[0],
      id: `guardian:${index}`,
      title: `Story ${index}`,
    }));
    expect(filterArticles(many, { ...base, page: 2 })).toHaveLength(2);
  });
});
