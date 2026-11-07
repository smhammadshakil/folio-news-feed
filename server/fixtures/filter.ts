import { PAGE_SIZE, type Article, type ArticleQuery } from "../../shared/article.js";

export function rebaseToRecent(articles: Article[], now = Date.now()): Article[] {
  const times = articles.map((article) => Date.parse(article.publishedAt)).filter((time) => !Number.isNaN(time));
  if (times.length === 0) return articles;
  const shift = now - 60 * 60 * 1000 - Math.max(...times);
  return articles.map((article) => {
    const time = Date.parse(article.publishedAt);
    if (Number.isNaN(time)) return article;
    return { ...article, publishedAt: new Date(time + shift).toISOString() };
  });
}

export function filterArticles(articles: Article[], query: ArticleQuery): Article[] {
  const keyword = query.q?.trim().toLowerCase();
  const filtered = articles.filter((article) => {
    if (keyword) {
      const haystack = `${article.title} ${article.summary}`.toLowerCase();
      if (!haystack.includes(keyword)) return false;
    }
    const day = article.publishedAt.slice(0, 10);
    if (query.from && day < query.from) return false;
    if (query.to && day > query.to) return false;
    if (query.categories.length > 0 && (!article.category || !query.categories.includes(article.category))) {
      return false;
    }
    return true;
  });
  const start = (query.page - 1) * PAGE_SIZE;
  return filtered.slice(start, start + PAGE_SIZE);
}
