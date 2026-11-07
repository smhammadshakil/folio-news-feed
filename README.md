# Folio

Folio is a personal news desk. It pulls articles from The Guardian, The New York Times, and NewsAPI.org, then lets you search, filter, and save the sources, categories, and authors you want to see first.

The interface is React, TypeScript, and Chakra UI, arranged with Atomic Design. A small Hono server holds the API keys and returns one shared article shape. With no keys, the same screens run on bundled sample articles.

## Run with Docker

Docker is the path to use for a review.

```bash
cp .env.example .env
docker compose up --build
```

Open http://localhost:4180.

Leave the keys blank to browse sample articles. For live news, set the three keys and `DATA_MODE=live`, then run `docker compose up --build` again. If `DATA_MODE` is omitted and at least one key is present, Folio calls the sources that have keys.

| Variable | Signup |
| --- | --- |
| `GUARDIAN_API_KEY` | https://open-platform.theguardian.com/access/ |
| `NYT_API_KEY` | https://developer.nytimes.com/ (Article Search) |
| `NEWSAPI_API_KEY` | https://newsapi.org/register |

`curl http://localhost:4180/api/health` returns `{"ok":true,"mode":"fixture"}` or `"mode":"live"`.

Stop the container with Ctrl+C.

## Run locally

```bash
npm install
cp .env.example .env
npm run dev
```

- App: http://127.0.0.1:4173
- API: http://127.0.0.1:4181

The app proxies `/api` to the API. `npm test` runs the unit tests. `npm start` serves the production build on port 4180 after `npm run build`.

## How to use it

- Search headlines. The keyword is kept in the address bar.
- Filter by date, category, and source. On a phone, filters open from the Filters button.
- My feed saves preferred sources, categories, and authors in this browser. A shared link does not overwrite that saved feed.
- If one source fails, stories from the others still show, and the page names the source that failed.

## Plan

How the take-home brief was met, including the three sources and where DRY, KISS, and SOLID show up in the code, is in [Challenge guidelines](docs/challenge-guidelines.md).

The build notes live in `docs/`:

1. [Requirements](docs/01-requirements.md)
2. [Architecture](docs/02-architecture.md)
3. [Atomic Design](docs/03-atomic-design.md)
4. [Data sources](docs/04-data-sources.md)
5. [UI behavior](docs/05-ui.md)
6. [Implementation steps](docs/06-implementation-steps.md)
7. [Docker](docs/07-docker.md)
8. [Engineering principles](docs/08-engineering-principles.md)
