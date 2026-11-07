import { describe, expect, it } from "vitest";
import { readEnv } from "./env.js";

describe("readEnv", () => {
  it("stays on sample articles when no key is set", () => {
    expect(readEnv({ DATA_MODE: "fixture" }).dataMode).toBe("fixture");
    expect(readEnv({}).dataMode).toBe("fixture");
  });

  it("uses live news whenever any API key is present", () => {
    expect(readEnv({ DATA_MODE: "fixture", GUARDIAN_API_KEY: "guardian-key" }).dataMode).toBe("live");
    expect(readEnv({ NYT_API_KEY: "nyt-key" }).dataMode).toBe("live");
    expect(readEnv({ NEWSAPI_API_KEY: "news-key" }).dataMode).toBe("live");
  });

  it("ignores blank keys", () => {
    expect(readEnv({ GUARDIAN_API_KEY: "  ", NYT_API_KEY: "", NEWSAPI_API_KEY: "" }).dataMode).toBe("fixture");
  });
});
