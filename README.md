# Folio

Folio is a personal news desk. It pulls articles from The Guardian, The New York Times, and NewsAPI.org, then lets you search, filter, and save the sources, categories, and authors you want to see first.

The interface is React, TypeScript, and Chakra UI, arranged with Atomic Design. A small Hono server holds the API keys and returns one shared article shape. With no keys, the same screens run on bundled sample articles.

## Add a local env file

Create `.env` in the project folder before you start the app. Copy the example, then paste your own keys into it. The file stays on your machine and is not committed.

```bash
cp .env.example .env
```

Open `.env` and set:

```bash
GUARDIAN_API_KEY=your-guardian-key
NYT_API_KEY=your-nyt-article-search-key
NEWSAPI_API_KEY=your-newsapi-key
```

| Variable | Signup |
| --- | --- |
| `GUARDIAN_API_KEY` | https://open-platform.theguardian.com/access/ |
| `NYT_API_KEY` | https://developer.nytimes.com/ (Article Search) |
| `NEWSAPI_API_KEY` | https://newsapi.org/register |

Any non-empty key selects live news, even if `DATA_MODE` is unset or set to `fixture`. Leave every key blank only if you want the bundled sample articles. A source with a blank key reports that its key is missing, and the other sources still return articles.

## Run with Docker

Docker is the path to use for a review. The `.env` file from the step above must already be in the project folder.

```bash
docker compose up --build
```

Open http://localhost:4180.

`curl http://localhost:4180/api/health` returns `{"ok":true,"mode":"fixture"}` or `"mode":"live"`.

Stop the container with Ctrl+C. After you change a key, run `docker compose up --build` again.

## Run locally

The `.env` file from the step above must already be in the project folder.

```bash
npm install
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
