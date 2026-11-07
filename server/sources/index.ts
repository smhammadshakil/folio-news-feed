import type { SourceId } from "../../shared/sources.js";
import type { Env } from "../env.js";
import { FailingSource, FixtureSource } from "./fixture.js";
import { GuardianSource } from "./guardian.js";
import { NewsApiSource } from "./newsapi.js";
import { NytSource } from "./nyt.js";
import type { NewsSource } from "./types.js";

const MISSING: Record<SourceId, string> = {
  guardian: "Guardian API key is not set",
  nyt: "New York Times API key is not set",
  newsapi: "NewsAPI API key is not set",
};

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
