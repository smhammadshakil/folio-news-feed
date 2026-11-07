import { describe, expect, it } from "vitest";
import { mapGuardian } from "./guardian.js";
import { mapNewsApi } from "./newsapi.js";
import { mapNyt, nytImage } from "./nyt.js";

describe("source mappers", () => {
  it("maps a Guardian result and strips trail html", () => {
    const [article] = mapGuardian([
      {
        id: "world/story",
        webTitle: "Clock change",
        webUrl: "https://www.theguardian.com/world",
        webPublicationDate: "2026-11-01T10:00:00Z",
        sectionId: "world",
        fields: { trailText: "<p>Evening arrives &amp; earlier.</p>", byline: "Ada Lovelace", thumbnail: "https://example.com/t.jpg" },
      },
    ]);
    expect(article).toMatchObject({
      id: "guardian:world/story",
      summary: "Evening arrives & earlier.",
      author: "Ada Lovelace",
      category: "world",
      source: "guardian",
    });
  });

  it("maps an NYT document, prefixes image paths, and drops a leading By", () => {
    expect(nytImage([{ type: "image", url: "images/2026/sample.jpg" }])).toBe(
      "https://static01.nyt.com/images/2026/sample.jpg",
    );
    const [article] = mapNyt([
      {
        _id: "nyt-1",
        web_url: "https://www.nytimes.com/",
        headline: { main: "Markets open steady" },
        abstract: "Trading was quiet.",
        pub_date: "2026-11-02T12:00:00Z",
        news_desk: "Business",
        byline: { original: "By Pat Lee" },
      },
    ]);
    expect(article).toMatchObject({
      id: "nyt:nyt-1",
      author: "Pat Lee",
      category: "business",
      source: "nyt",
    });
  });

  it("drops removed NewsAPI rows and keeps a missing description", () => {
    const articles = mapNewsApi(
      [
        { title: "[Removed]", url: "https://example.com/removed" },
        { title: "A sample", url: "https://www.reuters.com/", description: null, source: { name: "Reuters" }, publishedAt: "2026-11-03T00:00:00Z" },
      ],
      "business",
    );
    expect(articles).toHaveLength(1);
    expect(articles[0]).toMatchObject({
      source: "newsapi",
      sourceName: "Reuters",
      summary: "",
      category: "business",
    });
  });
});
