import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Article, ArticleQuery } from "../../shared/article.js";
import { httpUrl } from "../../shared/url.js";
import type { SourceId } from "../../shared/sources.js";
import { filterArticles, rebaseToRecent } from "../fixtures/filter.js";
import { SourceError, type NewsSource } from "./types.js";

export class FixtureSource implements NewsSource {
  constructor(readonly id: SourceId) {}

  async search(query: ArticleQuery, _signal: AbortSignal): Promise<Article[]> {
    const file = path.resolve(process.cwd(), "server/fixtures", `${this.id}.json`);
    try {
      const raw = await readFile(file, "utf8");
      const articles = rebaseToRecent(JSON.parse(raw) as Article[]).flatMap((article) => {
        const url = httpUrl(article.url);
        if (!url) return [];
        return [{ ...article, url, imageUrl: httpUrl(article.imageUrl) }];
      });
      return filterArticles(articles, query);
    } catch {
      throw new SourceError(`${this.id} sample articles are missing`);
    }
  }
}

export class FailingSource implements NewsSource {
  constructor(
    readonly id: SourceId,
    private readonly message: string,
  ) {}

  async search(): Promise<Article[]> {
    throw new SourceError(this.message);
  }
}
