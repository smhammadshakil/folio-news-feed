import { existsSync, readFileSync } from "node:fs";
import { Hono } from "hono";
import { serveStatic } from "@hono/node-server/serve-static";
import { CATEGORY_IDS } from "../shared/categories.js";
import { parseArticleQuery } from "../shared/query.js";
import { SOURCE_CATALOG } from "../shared/sources.js";
import { aggregate } from "./aggregate.js";
import { loadDotEnv, readEnv } from "./env.js";
import { allowSearch } from "./limit.js";
import { resolveSource } from "./sources/index.js";
import { loadStory } from "./story.js";
import { SourceError } from "./sources/types.js";

if (existsSync(".env")) loadDotEnv(readFileSync(".env", "utf8"));

export const env = readEnv();

export const app = new Hono();

app.get("/api/health", (c) => c.json({ ok: true, mode: env.dataMode }));

app.get("/api/sources", (c) =>
  c.json(
    SOURCE_CATALOG.map((source) => ({
      ...source,
      categories: [...CATEGORY_IDS],
    })),
  ),
);

app.get("/api/articles", async (c) => {
  const forwarded = c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
  const caller = (forwarded || c.req.header("x-real-ip") || "local").slice(0, 64);
  if (!allowSearch(caller)) {
    return c.json({ error: "Too many searches. Wait a minute and try again." }, 429);
  }

  const url = new URL(c.req.url);
  const parsed = parseArticleQuery(url.searchParams);
  if (!parsed.ok) return c.json({ error: parsed.error }, 400);
  try {
    const adapters = parsed.query.sources.map((id) => resolveSource(id, env));
    const page = await aggregate(adapters, parsed.query, c.req.raw.signal, env.dataMode);
    c.header("Cache-Control", "no-store");
    return c.json(page);
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") return c.body(null, 204);
    console.error(error instanceof Error ? error.message : "Article request failed");
    return c.json({ error: "The feed did not load" }, 500);
  }
});

app.get("/api/article", async (c) => {
  const forwarded = c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
  const caller = (forwarded || c.req.header("x-real-ip") || "local").slice(0, 64);
  if (!allowSearch(caller)) {
    return c.json({ error: "Too many searches. Wait a minute and try again." }, 429);
  }
  const id = new URL(c.req.url).searchParams.get("id")?.trim() ?? "";
  if (!id) return c.json({ error: "Missing story" }, 400);
  try {
    const story = await loadStory(id, env, c.req.raw.signal);
    c.header("Cache-Control", "no-store");
    return c.json(story);
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") return c.body(null, 204);
    if (error instanceof SourceError) return c.json({ error: error.message }, 404);
    console.error(error instanceof Error ? error.message : "Story request failed");
    return c.json({ error: "The story did not load" }, 500);
  }
});

app.all("/api/*", (c) => c.json({ error: "Not found" }, 404));

if (process.env.NODE_ENV === "production") {
  app.use("*", serveStatic({ root: "./dist" }));
  app.get("*", serveStatic({ path: "./dist/index.html" }));
}
