# Engineering principles

The brief asks for DRY, KISS, and SOLID. This is how those words map onto Folio, so they show up as structure instead of as comments.

## DRY

One representation for each fact:

| Fact | Single home |
| --- | --- |
| Article shape | `shared/article.ts` |
| Category labels and upstream maps | `shared/categories.ts` |
| Source names | `shared/sources.ts` |
| Preference parsing | `shared/preferences.ts` |
| Filter controls | `FilterPanel`, used by the sidebar and the mobile drawer |
| "What counts as a source error" | `SourceError` messages in each adapter, caught only in `aggregate.ts` |

If a label or a mapping is needed in a component, import it. Do not retype the category list in the JSX.

## KISS

- One route. Preferences are a drawer, not a second application.
- `localStorage`, not accounts.
- An in-memory 60-second cache, not Redis.
- Fixture mode is a `NewsSource` implementation, not a parallel UI.
- No global state library. The page holds the request state. The URL and `localStorage` are the two stores.
- No date library. `Intl.RelativeTimeFormat` and `YYYY-MM-DD` strings are enough.
- No component barrel files.

When a step suggests a helper that would be used once, keep the code inline.

## SOLID

### Single responsibility

| Unit | One reason to change |
| --- | --- |
| A source adapter | That outlet's URL, auth, and JSON shape |
| `aggregate.ts` | How results are merged, deduped, and ordered |
| `server/query.ts` | How the HTTP query string becomes `ArticleQuery` |
| `FeedPage` | When to fetch and which state to show |
| `ArticleCard` | How one article looks |
| `usePreferences` | Reading and writing the saved feed |

### Open-closed

A new outlet is a new file implementing `NewsSource`, plus a line in the registry and a fixture file. `aggregate.ts`, the route, and the feed page stay as they are. The card already renders `sourceName` from data.

### Liskov substitution

Every adapter honors `NewsSource.search`:

- It resolves to `Article[]` using only the shared type.
- It throws `SourceError` on failure instead of returning a second shape.
- It respects `page` and a page size of 10.
- It does not apply the author filter.

The fixture adapter is substitutable for a live one. That is why `DATA_MODE` can switch implementations without a UI branch.

Tests should use a fake adapter, not a subclass that overrides private fetch helpers. If a fake cannot stand in for Guardian, the interface is wrong.

### Interface segregation

Callers do not depend on a "god" news client.

- The UI knows `Article`, `ArticleQuery`, and `ArticlePage`.
- The aggregator knows `NewsSource`.
- Adapters know their own HTTP client and the shared mapper helpers they actually use.
- Preferences are a separate type from `ArticleQuery`. They happen to share fields, but saving a feed and running a search are different operations. Do not make `Preferences` extend the HTTP query.

### Dependency inversion

`FeedPage` depends on `src/api/client.ts`, not on Guardian's URL. The route depends on the `NewsSource` interface, not on `fetch` inside the route handler. The registry is the composition root: it is the only module that decides "live Guardian" versus "fixture."

Do not pass a raw `fetch` response into a component to "be flexible."

## Practical smells to reject in review

- A `switch (article.source)` in `ArticleCard` to pick a layout per outlet. Use data (name, color on `SourceBadge`) instead. A color map keyed by `SourceId` inside the badge is fine; forked JSX is not.
- Copy-pasted date formatting in a second component. Use `TimeAgo`.
- API keys read in any file under `src/`.
- A component under `atoms/`, `molecules/`, or `organisms/` importing `src/api/client.ts` or calling `localStorage`.
- Catching an adapter error and returning an empty list with no `SourceStatus`. The reader must be able to tell "no news" from "this source failed."
- Adding Redux, a database, or a fourth framework to look complete.

## Testing bar

Test the logic that is easy to get wrong and expensive to click through:

| Area | Test |
| --- | --- |
| Query parser | 400 cases and happy path |
| Fixture filter | Keyword, date, category, page |
| Each mapper | Sanitized upstream JSON to `Article` |
| Aggregator | Partial failure, dedupe, author filter, sort |
| `parsePreferences` | Missing, valid, and corrupt JSON |

Do not snapshot the whole page. The responsive check in step 16 is a manual pass at four widths, because that is the requirement and a screenshot suite would be theater at this size.

## Configuration and secrets

- Keys are environment variables on the server only.
- `.env` is gitignored. `.env.example` is committed with empty values.
- Error messages never echo the key or the upstream body.
- `DATA_MODE` defaults to `fixture`, so the secure and the convenient path are the same path.
