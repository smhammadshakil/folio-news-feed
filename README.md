# Folio

Folio is a personal news desk. It pulls articles from three sources, normalizes them into one feed, and lets a reader search, filter, and save the sources, categories, and authors they actually want.

This repository currently holds the **build plan** for the innoscripta Frontend Developer 2025 take-home. Implementation follows the steps in order; each step has files to add and an exit check.

## What the finished app does

- Search articles by keyword.
- Filter by date, category, and source.
- Save a personal feed: preferred sources, categories, and authors. Preferences live in the browser.
- Stay usable on a phone and on a wide screen.
- Keep working when one source fails, and run on bundled sample articles when API keys are absent.

## Stack

| Concern | Choice |
| --- | --- |
| UI | React 19, TypeScript, Vite |
| Components | Chakra UI 3, organized with Atomic Design |
| API | Small Hono server in the same repo. The browser never holds API keys |
| Sources | The Guardian, The New York Times, NewsAPI.org |
| Preferences | `localStorage` |
| Shipping | One Docker image that serves the UI and the API |

Why these choices are fixed is in [docs/02-architecture.md](docs/02-architecture.md).

## How to read the plan

Read in this order:

1. [Requirements](docs/01-requirements.md) — what the brief demands, and how each line is covered.
2. [Architecture](docs/02-architecture.md) — processes, folders, request flow, decisions.
3. [Atomic Design](docs/03-atomic-design.md) — every component, its level, and what it is allowed to know.
4. [Data sources](docs/04-data-sources.md) — the three APIs, the shared article shape, and category mapping.
5. [UI behavior](docs/05-ui.md) — screens, states, responsive rules, theme.
6. [Implementation steps](docs/06-implementation-steps.md) — the build order. Do not skip ahead.
7. [Docker](docs/07-docker.md) — image, compose, environment variables.
8. [Engineering principles](docs/08-engineering-principles.md) — how DRY, KISS, and SOLID show up in this codebase.

## Repository shape (once the steps are done)

```
src/                  React app
  components/
    atoms/
    molecules/
    organisms/
    templates/
  pages/
  theme/
server/               Hono BFF
shared/               Article type, source catalog, category map
docs/
Dockerfile
docker-compose.yml
.env.example
```

Fetching stays in `server/` and in page-level hooks. Atoms, molecules, and organisms only receive props.

## Running it later

After step 17, from the repo root:

```bash
cp .env.example .env
docker compose up --build
```

The app listens on port **4180**. With no API keys, `DATA_MODE` stays `fixture` and the feed renders sample articles. Adding `GUARDIAN_API_KEY`, `NYT_API_KEY`, and `NEWSAPI_API_KEY`, then setting `DATA_MODE=live`, switches the same UI onto the real sources.

Local development without Docker is in [docs/07-docker.md](docs/07-docker.md).
