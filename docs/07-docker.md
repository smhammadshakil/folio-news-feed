# Docker

The reviewer's path is one container. It serves the built React app and the Hono API on port **4180**.

## Files to add in step 17

```
Dockerfile
docker-compose.yml
.dockerignore
.env.example
```

## Image

Multi-stage build.

| Stage | Base | What it does |
| --- | --- | --- |
| `deps` | `node:22-alpine` | `npm ci` |
| `build` | `node:22-alpine` | `npm run build`, producing `dist/` (client) and `dist-server/` (API) |
| `runtime` | `node:22-alpine` | Production dependencies only, plus `dist/` and `dist-server/`. `NODE_ENV=production`. Listens on 4180. |

`runtime` does not include the Vite dev server, the test runner, or the TypeScript sources.

The server, when `NODE_ENV=production`, serves files from `dist/` and falls back to `dist/index.html` for any path that is not under `/api`. Unknown `/api` routes still 404 as JSON.

`.dockerignore` must exclude `node_modules`, `dist`, `dist-server`, `.env`, `.git`, and `uploads`. Keys are passed in at run time, never baked into the image.

## Compose

`docker-compose.yml`:

- One service, `web`.
- Build context `.`.
- `env_file: .env`.
- `ports: ["4180:4180"]`.
- `environment` sets `PORT=4180` so a stray `.env` value cannot move the port the mapping expects.

No database container. No reverse proxy.

## Environment

`.env.example`:

```bash
# fixture serves bundled sample articles and needs no keys.
# live calls The Guardian, The New York Times, and NewsAPI.org.
DATA_MODE=fixture

GUARDIAN_API_KEY=
NYT_API_KEY=
NEWSAPI_API_KEY=
```

Where to get keys, for the README:

| Variable | Signup |
| --- | --- |
| `GUARDIAN_API_KEY` | https://open-platform.theguardian.com/access/ |
| `NYT_API_KEY` | https://developer.nytimes.com/ (Article Search) |
| `NEWSAPI_API_KEY` | https://newsapi.org/register |

Copy the example to `.env` and leave the keys blank to run the sample feed.

## Commands the README will document

From the repository root, after Docker is installed:

```bash
cp .env.example .env
docker compose up --build
```

Then open `http://localhost:4180`.

Stop with Ctrl+C, or `docker compose down` from another terminal.

Switch to live news:

```bash
# fill the three keys in .env, set DATA_MODE=live, then:
docker compose up --build
```

`curl http://localhost:4180/api/health` returns `{"ok":true,"mode":"fixture"}` or `"mode":"live"`.

## Local development, without Docker

This is the secondary path, documented after the Docker path.

```bash
npm install
cp .env.example .env
npm run dev
```

- UI: `http://127.0.0.1:4173`
- API: `http://127.0.0.1:4181`
- The UI proxies `/api` to the API, so the browser only talks to 4173.

```bash
npm test
npm run build
npm start
```

`npm start` serves the production build on port 4180, same as the container, using whatever `.env` is in the shell.

## What "works in Docker" means

- `docker compose up --build` finishes without a host-side `npm install`.
- Port 4180 serves the feed and `/api/articles`.
- Reloading a deep link such as `/?q=climate&category=science` returns `index.html`, then the client reads the query.
- The container logs do not print API keys.
- Fixture mode needs no outbound call. Live mode needs outbound HTTPS to `content.guardianapis.com`, `api.nytimes.com`, and `newsapi.org`.
