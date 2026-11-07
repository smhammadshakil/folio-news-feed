export type DataMode = "fixture" | "live";

export type Env = {
  dataMode: DataMode;
  port: number;
  guardianKey: string;
  nytKey: string;
  newsApiKey: string;
};

export function loadDotEnv(text: string, target: NodeJS.ProcessEnv = process.env): void {
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (target[key] === undefined) target[key] = value;
  }
}

export function readEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const requested = source.DATA_MODE;
  const hasKey = Boolean(source.GUARDIAN_API_KEY?.trim() || source.NYT_API_KEY?.trim() || source.NEWSAPI_API_KEY?.trim());
  const mode = requested ?? (hasKey ? "live" : "fixture");
  if (mode !== "fixture" && mode !== "live") {
    throw new Error("DATA_MODE must be fixture or live");
  }
  const fallback = source.NODE_ENV === "production" ? 4180 : 4181;
  const parsed = Number(source.PORT ?? fallback);
  const port = Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
  return {
    dataMode: mode,
    port,
    guardianKey: source.GUARDIAN_API_KEY?.trim() ?? "",
    nytKey: source.NYT_API_KEY?.trim() ?? "",
    newsApiKey: source.NEWSAPI_API_KEY?.trim() ?? "",
  };
}
