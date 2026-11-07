# Requirements

Source: Frontend Developer take-home (innoscripta, 2025). This file restates each requirement as something that can be checked off, then maps it to the part of the plan that satisfies it.

## Product

Folio is the interface for a news aggregator. It pulls articles from more than one source and shows them in one readable feed.

## Functional requirements

### 1. Search and filter

A reader can:

- Search by keyword. The query is debounced (300ms) and written to the URL.
- Filter by date. Presets: today, last 7 days, last 30 days, plus a custom from/to range. Dates are calendar dates in the reader's local zone, sent to the API as `YYYY-MM-DD`.
- Filter by category. One closed list, shared by every source (see [data sources](04-data-sources.md)).
- Filter by source. Any subset of Guardian, New York Times, and NewsAPI.

Filters combine with AND. Clearing a filter removes only that constraint. An empty keyword means "latest in the current filters," not an error.

### 2. Personalized feed

A reader can save:

- Preferred sources (one or more).
- Preferred categories (one or more).
- Preferred authors (zero or more names, matched as a case-insensitive substring of the article byline).

Saved preferences are the default feed on the next visit. They are stored in `localStorage` under `folio.preferences.v1`. There is no account system.

Changing filters on the feed updates the URL only. A separate **Save as my feed** action writes the current selection into preferences. **Reset feed** restores the built-in default (all sources, all categories, no authors).

### 3. Mobile-responsive layout

The same routes work from a narrow phone to a wide desktop. Layout rules are in [UI behavior](05-ui.md). Nothing the reader can do on desktop is missing on mobile; filters move into a drawer, they are not dropped.

## Challenge constraints

| Constraint | Decision |
| --- | --- |
| React with TypeScript | Vite + React 19 + TypeScript. Strict compiler options. |
| At least three sources from the brief's list | The Guardian, The New York Times Article Search, NewsAPI.org. |
| Docker, with docs for running the container | One image, `docker compose up --build`, documented in [Docker](07-docker.md). |
| DRY, KISS, SOLID | Applied in [Engineering principles](08-engineering-principles.md). The concrete mechanism is one `NewsSource` adapter per outlet and one `Article` type. |

## Explicitly out of scope

These are not required by the brief and are not part of the plan:

- User accounts, passwords, or a database.
- Saving individual articles, comments, or sharing graphs.
- An article-detail page. The card links out to the original story.
- Payments, newsletters, or a CMS.
- More than the three sources above. A fourth source should be a new adapter only, added after the three work.

## Acceptance checklist

The project is done when every row below is true.

| # | Check |
| --- | --- |
| A1 | Typing a keyword narrows the feed. The keyword survives a reload via the URL. |
| A2 | Date, category, and source filters each change the results, and they work together. |
| A3 | Saving sources, categories, and authors changes the feed that loads on a fresh visit. |
| A4 | Resetting preferences returns the default feed. |
| A5 | At 375px width the feed is one column, filters open in a drawer, and text does not overflow. |
| A6 | At 1280px width filters sit in a sidebar and cards sit in a grid. |
| A7 | With one source returning an error, articles from the other sources still render, and the UI names the source that failed. |
| A8 | With `DATA_MODE=fixture`, the app runs with zero API keys. |
| A9 | With `DATA_MODE=live` and three keys, articles come from all three outlets. |
| A10 | `docker compose up --build` serves the UI and `/api/articles` from port 4180. |
| A11 | A component under `atoms/`, `molecules/`, or `organisms/` does not call `fetch` or read `localStorage`. |

## Traceability

| Brief line | Where it is handled |
| --- | --- |
| React.js with TypeScript | [Architecture](02-architecture.md), steps 0–1 |
| Choose at least three data sources | [Data sources](04-data-sources.md) |
| Docker and documentation | [Docker](07-docker.md), step 17 |
| DRY, KISS, SOLID | [Engineering principles](08-engineering-principles.md) |
| Search and filter by date, category, source | [UI](05-ui.md), steps 11–14 |
| Preferred sources, categories, authors | [UI](05-ui.md), step 15 |
| Mobile-responsive | [UI](05-ui.md), step 16 |
| Atomic Design, Chakra UI | [Atomic Design](03-atomic-design.md), steps 2 and 11–14 |
