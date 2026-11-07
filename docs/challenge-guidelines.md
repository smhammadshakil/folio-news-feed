# Challenge guidelines

This note answers the innoscripta Frontend Developer 2025 brief, point by point. The product is Folio, a news desk built with React, TypeScript, and Chakra UI.

## What the brief asked

1. A front-end project in React with TypeScript.
2. At least three data sources from the list in the brief.
3. The app containerized with Docker, plus documentation for running that container.
4. DRY, KISS, and SOLID in the code.
5. Search by keyword, and filter by date, category, and source.
6. A personalized feed: preferred sources, categories, and authors.
7. A layout that works on a phone.

## What Folio achieves

| Guideline | Where it lives |
| --- | --- |
| React + TypeScript | `src/`, strict `tsconfig.app.json`. The UI is a Vite app. |
| Three sources | The Guardian, The New York Times Article Search, and NewsAPI.org. |
| Docker | `Dockerfile`, `docker-compose.yml`, and the run steps in `README.md`. |
| DRY, KISS, SOLID | The sections below, with the code that carries each idea. |
| Search and filters | The header search box, the date / category / source panel, and the query string. |
| Personal feed | The **My feed** drawer. Preferences are stored in `localStorage` under `folio.preferences.v1`. |
| Mobile layout | Below the `lg` breakpoint the filter panel moves into a drawer. Cards are one column. |

Keys stay on a small Hono server in `server/`. The browser only calls `/api/articles`. That is still a front end: the server exists so NewsAPI.org is reachable (its free tier blocks browser calls) and so the three API keys are not shipped inside the JavaScript bundle.

With no keys, `DATA_MODE` stays `fixture` and the same screens render bundled sample articles. Setting the keys switches the same UI onto live news.

## Data sources

The brief lists NewsAPI, OpenNews, NewsCred, The Guardian, the New York Times, BBC News, and NewsAPI.org. Folio uses three of them.

| Id | Outlet | Endpoint | Why this one |
| --- | --- | --- | --- |
| `guardian` | The Guardian | `https://content.guardianapis.com/search` | A public developer key, sections that map onto the shared categories, and a byline plus thumbnail through `show-fields`. |
| `nyt` | The New York Times | `https://api.nytimes.com/svc/search/v2/articlesearch.json` | Named in the brief. Strong bylines. The free tier is about five requests a minute, so the adapter caches a response for 60 seconds. |
| `newsapi` | NewsAPI.org | `/v2/everything` and `/v2/top-headlines` | Named in the brief. Browser CORS is blocked on the free plan, which is why the request goes through the server. |

OpenNews and NewsCred do not offer a practical public developer API. BBC News has no equivalent open search API. NewsAPI and NewsAPI.org in the brief are the same product, so the third source is NewsAPI.org rather than a second copy of it.

Each source is one class with the same method. The page never sees Guardian JSON or NYT JSON.

```ts
export interface NewsSource {
  readonly id: SourceId;
  search(query: ArticleQuery, signal: AbortSignal): Promise<Article[]>;
}
```

`server/sources/index.ts` is the only place that picks an implementation. A missing key becomes a `FailingSource` with a short message. The other sources still return articles.

## Search, filters, and the personal feed

The on-screen query is an `ArticleQuery`: optional keyword, `from` and `to` as `YYYY-MM-DD`, category ids, source ids, author names, and a page number. Typing in the header updates `q` after a short pause. Date presets, category checkboxes, and source checkboxes update the address bar, so a reload keeps the same feed.

**My feed** writes a smaller object, `Preferences`, to `localStorage`: sources, categories, and authors. Opening `/` with an empty query string uses that saved feed. A shared URL overrides it for that visit and does not overwrite what was saved.

Author matching is the same for every outlet. It runs after the adapters return, because not every API can filter by author:

```ts
if (query.authors.length > 0) {
  const names = query.authors.map((author) => author.toLowerCase());
  articles = articles.filter((article) => {
    if (!article.author) return false;
    const byline = article.author.toLowerCase();
    return names.some((name) => byline.includes(name));
  });
}
```

## Mobile

`FilterPanel` is one component. On a wide screen it sits in the sidebar. On a narrow screen `FeedPage` renders that same component inside a drawer opened by **Filters**. `ArticleList` is one column until `lg`, then two, then three. Touch targets for the filter controls are at least 44px tall.

## Docker

One image builds the client and the server, then serves both on port 4180.

```dockerfile
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4180
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
COPY --from=build /app/dist-server ./dist-server
COPY --from=build /app/server/fixtures ./server/fixtures
EXPOSE 4180
CMD ["node", "dist-server/server/index.js"]
```

From the repository root:

```bash
cp .env.example .env
docker compose up --build
```

Open `http://localhost:4180`. Leave the keys blank for sample articles. For live news, fill `GUARDIAN_API_KEY`, `NYT_API_KEY`, and `NEWSAPI_API_KEY`, set `DATA_MODE=live`, and run the same command again. `GET /api/health` reports `fixture` or `live`.

## DRY

Each fact has one home.

The article shape is declared once in `shared/article.ts` and imported by the React app and the server. Category labels and the Guardian section names and NYT news desks live once in `shared/categories.ts`. Outlet display names live once in `shared/sources.ts`.

The checkbox rule "keep at least one source, and treat an empty category list as all categories" is one function. Both the filter panel and the preferences form call it:

```ts
export function toggleWithFloor<T extends string>(
  all: readonly T[],
  selected: readonly T[],
  id: T,
  emptyMeansAll: boolean,
): T[] {
  const current = new Set(emptyMeansAll && selected.length === 0 ? all : selected);
  if (current.has(id)) {
    if (current.size === 1) return emptyMeansAll && selected.length === 0 ? [] : [...current];
    current.delete(id);
  } else {
    current.add(id);
  }
  const next = all.filter((item) => current.has(item));
  if (emptyMeansAll && next.length === all.length) return [];
  return next;
}
```

`FeedPage` mounts `FilterPanel` twice, once in the sidebar and once in the mobile drawer. There is no second copy of the date, category, or source controls.

Sample articles and live articles go through the same `NewsSource.search` method. Fixture mode is not a second UI.

## KISS

The app has one route. Preferences are a drawer on that route, not a second site.

There are no accounts and no database. The saved feed is `localStorage`. The NYT rate-limit cache is a `Map` in the adapter, kept for 60 seconds, not Redis. Dates use `Intl.RelativeTimeFormat` and `YYYY-MM-DD` strings, not a date library. There is no global state library: the page holds the request, the URL holds the filters, and `localStorage` holds the saved feed.

A missing key or a failed outlet does not grow a special screen. `aggregate` records `{ status: "error", message }` for that source and still returns the articles it has.

## SOLID

### Single responsibility

| Unit | The only reason it changes |
| --- | --- |
| `server/sources/guardian.ts` | The Guardian URL, key, and JSON |
| `server/sources/nyt.ts` | The NYT URL, key, cache, and JSON |
| `server/sources/newsapi.ts` | The NewsAPI URL, key, and JSON |
| `server/aggregate.ts` | Merge, dedupe, author filter, sort |
| `shared/query.ts` | Turning the query string into an `ArticleQuery` |
| `FeedPage` | When to fetch, and which state to show |
| `ArticleCard` | How one story looks |

`ArticleCard` receives an `Article`. It does not call `fetch` or read `localStorage`.

### Open-closed

Adding a fourth outlet means a new class that implements `NewsSource`, plus one branch in `resolveSource`. `aggregate`, the route, and the card stay as they are. The card already prints `article.sourceName` from the data.

### Liskov substitution

`GuardianSource`, `NytSource`, `NewsApiSource`, `FixtureSource`, and `FailingSource` all honor `NewsSource.search`:

- They resolve to `Article[]`.
- They throw `SourceError` on failure, rather than returning a second shape.
- They do not apply the author filter. The aggregator does.

Because the fixture adapter is a valid substitute, the UI does not branch on `DATA_MODE`. The tests pass fake objects with the same `search` method into `aggregate`.

### Interface segregation

The UI depends on `Article`, `ArticleQuery`, and `ArticlePage`. It does not depend on Guardian's response type. The aggregator depends on `NewsSource`, not on `fetch`. Preferences are their own type. They share fields with the query, but saving a feed and running a search stay separate functions.

### Dependency inversion

`FeedPage` calls `src/api/client.ts`. That client calls `/api/articles`. It does not know `content.guardianapis.com`. The route calls `resolveSource`, then `aggregate`. Only `resolveSource` decides "live Guardian" versus "fixture" versus "key missing".

```ts
export function resolveSource(id: SourceId, env: Env): NewsSource {
  if (env.dataMode === "fixture") return new FixtureSource(id);
  if (id === "guardian") {
    return env.guardianKey ? new GuardianSource(env.guardianKey) : new FailingSource(id, MISSING.guardian);
  }
  if (id === "nyt") {
    return env.nytKey ? new NytSource(env.nytKey) : new FailingSource(id, MISSING.nyt);
  }
  return env.newsApiKey ? new NewsApiSource(env.newsApiKey) : new FailingSource(id, MISSING.newsapi);
}
```

## Shared article shape

Every adapter maps onto this type before the UI sees it:

```ts
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
```

`source` is `guardian`, `nyt`, or `newsapi`. `sourceName` is what the card prints, so a NewsAPI story can still show "Reuters" while the filter id stays `newsapi`.

The closed category list is `world`, `politics`, `business`, `technology`, `science`, `health`, `sports`, `culture`, and `opinion`. Guardian's `society` section maps to `health`, `sport` maps to `sports`, and `commentisfree` maps to `opinion`. Those maps are only in `shared/categories.ts`.
