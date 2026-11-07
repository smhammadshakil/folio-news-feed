# Data sources

Folio uses three sources from the brief. Each one is a class that implements the same `NewsSource` interface. The UI never branches on the upstream JSON.

| Id | Outlet | API | Why this one |
| --- | --- | --- | --- |
| `guardian` | The Guardian | Content API | Free developer key, sections map cleanly onto categories, byline and thumbnail are available via `show-fields`. |
| `nyt` | The New York Times | Article Search | Named in the brief. Strong bylines. Tight rate limit, so the server caches briefly. |
| `newsapi` | NewsAPI.org | `/v2/everything` and `/v2/top-headlines` | Named in the brief. Browser CORS is blocked on the free plan, which is why the BFF exists. |

OpenNews and NewsCred are not public developer APIs in any practical sense. BBC News has no equivalent open search API. NewsAPI and NewsAPI.org in the brief refer to the same product. Three working sources beat five names that cannot be called.

## `NewsSource`

```ts
interface NewsSource {
  readonly id: SourceId;
  search(query: ArticleQuery, signal: AbortSignal): Promise<Article[]>;
}
```

- `search` returns articles already mapped to `Article`. It does not return upstream JSON.
- It throws `SourceError` with a short `message` on HTTP errors, timeouts, and bad payloads. The aggregator catches that throw.
- It does not filter by author. The aggregator does, because author matching is the same for every source.
- It does apply date, keyword, category, and page, pushing as much as the upstream API allows.

The registry in `server/sources/index.ts` is the only place that lists the classes. Adding a source later means a new file plus one registry line. Existing adapters stay closed.

## Shared categories

The filter UI shows these ids and labels:

| Id | Label |
| --- | --- |
| `world` | World |
| `politics` | Politics |
| `business` | Business |
| `technology` | Technology |
| `science` | Science |
| `health` | Health |
| `sports` | Sports |
| `culture` | Culture |
| `opinion` | Opinion |

Upstream names differ. The maps below are the single copy, in `shared/categories.ts`. An upstream section that is not in the map produces an article with `category` left undefined.

### Guardian section id

| Category | Guardian `section` |
| --- | --- |
| world | `world` |
| politics | `politics` |
| business | `business` |
| technology | `technology` |
| science | `science` |
| health | `society` |
| sports | `sport` |
| culture | `culture` |
| opinion | `commentisfree` |

When several categories are selected, call Guardian once **without** a section and let the aggregator safety-net filter. Guardian's `section` parameter is a single value. When exactly one category is selected, pass it.

### NYT news desk

| Category | `news_desk` values |
| --- | --- |
| world | World |
| politics | Politics, U.S. |
| business | Business, Financial |
| technology | Technology |
| science | Science |
| health | Health, Well |
| sports | Sports |
| culture | Arts, Style, Food |
| opinion | Opinion, OpEd |

The adapter builds `fq=news_desk:("Technology" "Business")` from the selected categories. NYT dates are `YYYYMMDD`.

### NewsAPI

`top-headlines` categories are a smaller set: business, entertainment, general, health, science, sports, technology. They do not cover world, politics, culture, or opinion well.

Rules:

- No keyword and exactly one category that NewsAPI supports (`business`, `health`, `science`, `sports`, `technology`): call `/v2/top-headlines?category=`.
- Any other case: call `/v2/everything` with `q` set to the keyword, or to the selected category labels joined by ` OR ` when the keyword is empty.
- Map `article.category` from our query when we sent a single category. Otherwise leave it unset and let the safety net keep the article only if the reader did not filter by category. NewsAPI search results do not include a reliable section.

Language for NewsAPI is `en`.

## Per-source query translation

### Guardian

`GET https://content.guardianapis.com/search`

| Folio | Upstream |
| --- | --- |
| `q` | `q` |
| `from`, `to` | `from-date`, `to-date` |
| one category | `section` |
| `page` | `page` |
| page size 10 | `page-size=10` |
| always | `show-fields=trailText,thumbnail,byline` |
| always | `order-by=newest` |
| key | `api-key` header or query, server side |

Mapping:

| Article field | Guardian field |
| --- | --- |
| `id` | `guardian:${id}` |
| `title` | `webTitle` |
| `summary` | `fields.trailText` with HTML tags stripped. Fall back to `""`. |
| `url` | `webUrl` |
| `imageUrl` | `fields.thumbnail` |
| `publishedAt` | `webPublicationDate` |
| `author` | `fields.byline` |
| `sourceName` | `"The Guardian"` |

### New York Times

`GET https://api.nytimes.com/svc/search/v2/articlesearch.json`

| Folio | Upstream |
| --- | --- |
| `q` | `q` (omit the param when empty) |
| `from`, `to` | `begin_date`, `end_date` as `YYYYMMDD` |
| categories | `fq=news_desk:(...)` |
| `page` | `page` (NYT is 0-based: send `page - 1`) |
| always | `sort=newest` |
| key | `api-key` |

Free-tier Article Search is about 5 requests per minute and 500 per day. The server keeps an in-memory cache keyed by the full upstream URL for **60 seconds**. The cache is per process and is fine for a take-home; do not add Redis.

Mapping, from `response.docs[]`:

| Article field | NYT field |
| --- | --- |
| `id` | `nyt:${_id}` |
| `title` | `headline.main` |
| `summary` | `abstract` or `snippet` |
| `url` | `web_url` |
| `imageUrl` | First `multimedia` entry whose `type` is `image`. Prefix `https://static01.nyt.com/` when the URL is a path. |
| `publishedAt` | `pub_date` |
| `author` | `byline.original` with a leading "By " removed |
| `sourceName` | `"The New York Times"` |

### NewsAPI.org

| Folio | Upstream |
| --- | --- |
| keyword or category text | `q` |
| `from`, `to` | `from`, `to` (ISO date; the API accepts `YYYY-MM-DD`) |
| `page` | `page` |
| page size | `pageSize=10` |
| always | `language=en`, `sortBy=publishedAt` |
| key | `X-Api-Key` header |

Mapping, from `articles[]`:

| Article field | NewsAPI field |
| --- | --- |
| `id` | `newsapi:${url}` |
| `title` | `title`. Drop the item when title is `"[Removed]"`. |
| `summary` | `description` or `""` |
| `url` | `url` |
| `imageUrl` | `urlToImage` |
| `publishedAt` | `publishedAt` |
| `author` | `author` |
| `sourceName` | `source.name` |

`Article.source` stays `"newsapi"` even when `sourceName` is the original publisher ("Reuters", "Wired"). The badge shows `sourceName`, so the reader sees the outlet. The filter id stays `newsapi`, because that is the adapter they toggled.

## Fixture mode

`server/fixtures/{guardian,nyt,newsapi}.json` each hold 12 articles already in the `Article` shape, spread across several categories and dates. The fixture adapter:

- Filters by keyword against `title` and `summary` (case-insensitive includes).
- Filters by `from` / `to` against `publishedAt`.
- Filters by category when the article has one.
- Ignores the network.
- Paginates with the same page size of 10 so "Load more" can be exercised (include 12 items so page 2 is short).

Fixtures are hand-written summaries and public article URLs. Do not check in a dump of a live API response that includes a key or a huge payload.

## Errors worth mapping

| Upstream signal | `SourceError.message` |
| --- | --- |
| Missing key in live mode | `{Name} API key is not set` |
| HTTP 401 or 403 | `{Name} rejected the API key` |
| HTTP 429 | `{Name} rate limit reached` |
| Timeout (8s) | `{Name} timed out` |
| Anything else | `{Name} is unavailable` |

`{Name}` is "Guardian", "New York Times", or "NewsAPI". The UI prints `message` as-is, so keep it to one short sentence and do not include the key, the URL, or the response body.
