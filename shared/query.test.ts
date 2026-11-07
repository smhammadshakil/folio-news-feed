import { describe, expect, it } from "vitest";
import { defaultPreferences } from "./preferences.js";
import { mergePageQuery, paramsFromEffective, parseArticleQuery } from "./query.js";

describe("parseArticleQuery", () => {
  it("uses every source when none are requested", () => {
    const parsed = parseArticleQuery(new URLSearchParams("q=climate"));
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.query.q).toBe("climate");
    expect(parsed.query.sources).toEqual(["guardian", "nyt", "newsapi"]);
    expect(parsed.query.page).toBe(1);
  });

  it("accepts repeated and comma-separated values", () => {
    const parsed = parseArticleQuery(new URLSearchParams("category=world,science&source=guardian&source=nyt&page=2"));
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.query.categories).toEqual(["world", "science"]);
    expect(parsed.query.sources).toEqual(["guardian", "nyt"]);
    expect(parsed.query.page).toBe(2);
  });

  it("rejects a search longer than 200 characters", () => {
    const parsed = parseArticleQuery(new URLSearchParams({ q: "a".repeat(201) }));
    expect(parsed.ok).toBe(false);
  });

  it("rejects an unknown source and a bad date", () => {
    expect(parseArticleQuery(new URLSearchParams("source=bbc")).ok).toBe(false);
    expect(parseArticleQuery(new URLSearchParams("from=2026-13-01")).ok).toBe(false);
    expect(parseArticleQuery(new URLSearchParams("page=0")).ok).toBe(false);
  });

  it("treats category=all as every category", () => {
    const parsed = parseArticleQuery(new URLSearchParams("category=all"));
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.query.categories).toEqual([]);
  });
});

describe("mergePageQuery", () => {
  it("lets a url value replace the saved feed", () => {
    const preferences = { ...defaultPreferences, categories: ["technology" as const], authors: ["Mina Rahman"] };
    const merged = mergePageQuery(preferences, new URLSearchParams("category=sports"));
    expect(merged.ok).toBe(true);
    if (!merged.ok) return;
    expect(merged.query.categories).toEqual(["sports"]);
    expect(merged.query.authors).toEqual(["Mina Rahman"]);
  });

  it("writes an explicit all-categories override when it differs from the saved feed", () => {
    const preferences = { ...defaultPreferences, categories: ["technology" as const] };
    const params = paramsFromEffective(
      { categories: [], sources: preferences.sources, authors: [], page: 1 },
      preferences,
    );
    expect(params.get("category")).toBe("all");
    const merged = mergePageQuery(preferences, params);
    expect(merged.ok).toBe(true);
    if (!merged.ok) return;
    expect(merged.query.categories).toEqual([]);
  });
});
