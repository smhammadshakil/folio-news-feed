import { describe, expect, it } from "vitest";
import type { Env } from "./env.js";
import { loadStory } from "./story.js";

const fixtureEnv: Env = {
  dataMode: "fixture",
  port: 4181,
  guardianKey: "",
  nytKey: "",
  newsApiKey: "",
};

describe("loadStory", () => {
  it("opens a sample story with a column and more than one picture", async () => {
    const story = await loadStory("guardian:1", fixtureEnv, new AbortController().signal);
    expect(story.title).toBe("Climate desk notes");
    expect(story.paragraphs.length).toBeGreaterThan(1);
    expect(story.images.length).toBeGreaterThan(1);
  });

  it("rejects an unknown id", async () => {
    await expect(loadStory("guardian:../secret", fixtureEnv, new AbortController().signal)).rejects.toThrow("Unknown story");
  });
});
