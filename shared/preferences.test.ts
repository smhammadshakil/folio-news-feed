import { describe, expect, it } from "vitest";
import { defaultPreferences, parsePreferences, serializePreferences } from "./preferences.js";

describe("parsePreferences", () => {
  it("returns the default for missing and corrupt values", () => {
    expect(parsePreferences(null)).toEqual(defaultPreferences);
    expect(parsePreferences("{")).toEqual(defaultPreferences);
    expect(parsePreferences(JSON.stringify({ sources: [] }))).toEqual(defaultPreferences);
  });

  it("keeps a valid saved feed", () => {
    const saved = serializePreferences({
      sources: ["guardian"],
      categories: ["science"],
      authors: ["Mina Rahman"],
    });
    expect(parsePreferences(saved)).toEqual({
      sources: ["guardian"],
      categories: ["science"],
      authors: ["Mina Rahman"],
    });
  });
});
