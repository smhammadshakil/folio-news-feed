import { describe, expect, it } from "vitest";
import type { Article, ArticleQuery } from "../shared/article.js";
import { aggregate } from "./aggregate.js";
import { SourceError, type NewsSource } from "./sources/types.js";

const query: ArticleQuery = { categories: [], sources: ["guardian", "nyt", "newsapi"], authors: [], page: 1 };

function article(partial: Partial<Article> & Pick<Article, "id" | "source" | "url">): Article {
  return {
    title: partial.title ?? partial.id,
    summary: "",
    publishedAt: partial.publishedAt ?? "2026-11-01T00:00:00.000Z",
    sourceName: partial.source,
    ...partial,
  };
}

function source(id: NewsSource["id"], result: Article[] | Error): NewsSource {
  return {
    id,
    search: async () => {
      if (result instanceof Error) throw result;
      return result;
    },
  };
}

describe("aggregate", () => {
  it("keeps articles when one source fails", async () => {
    const page = await aggregate(
      [
        source("guardian", [article({ id: "g", source: "guardian", url: "https://www.theguardian.com/a" })]),
        source("nyt", new SourceError("New York Times rate limit reached")),
      ],
      query,
      new AbortController().signal,
      "live",
    );
    expect(page.articles).toHaveLength(1);
    expect(page.sources.find((item) => item.id === "nyt")).toMatchObject({
      status: "error",
      message: "New York Times rate limit reached",
    });
  });

  it("dedupes by url and keeps the earlier story, preferring Guardian on a tie", async () => {
    const shared = "https://www.example.com/story";
    const page = await aggregate(
      [
        source("newsapi", [
          article({ id: "n", source: "newsapi", url: shared, publishedAt: "2026-11-02T00:00:00.000Z", title: "Late" }),
        ]),
        source("guardian", [
          article({ id: "g", source: "guardian", url: "https://www.example.com/story/", publishedAt: "2026-11-02T00:00:00.000Z", title: "Same time" }),
        ]),
        source("nyt", [
          article({ id: "y", source: "nyt", url: "https://www.example.com/story?ref=rss", publishedAt: "2026-11-01T00:00:00.000Z", title: "Earlier" }),
        ]),
      ],
      query,
      new AbortController().signal,
      "fixture",
    );
    expect(page.articles).toHaveLength(1);
    expect(page.articles[0]?.id).toBe("y");
  });

  it("drops a missing byline when an author filter is active and sorts newest first", async () => {
    const page = await aggregate(
      [
        source("guardian", [
          article({ id: "old", source: "guardian", url: "https://www.theguardian.com/old", author: "Mina Rahman", publishedAt: "2026-10-01T00:00:00.000Z" }),
          article({ id: "anon", source: "guardian", url: "https://www.theguardian.com/anon", publishedAt: "2026-11-05T00:00:00.000Z" }),
          article({ id: "new", source: "guardian", url: "https://www.theguardian.com/new", author: "Edited by Mina Rahman", publishedAt: "2026-11-03T00:00:00.000Z", category: "world" }),
        ]),
      ],
      { ...query, authors: ["mina"], categories: ["world"], sources: ["guardian"] },
      new AbortController().signal,
      "fixture",
    );
    expect(page.articles.map((item) => item.id)).toEqual(["new"]);
  });
});
