import { CATEGORY_IDS, isCategoryId, type CategoryId } from "./categories.js";
import { SOURCE_IDS, isSourceId, type SourceId } from "./sources.js";

export const PREFERENCES_KEY = "folio.preferences.v1";

export type Preferences = {
  sources: SourceId[];
  categories: CategoryId[];
  authors: string[];
};

export const defaultPreferences: Preferences = {
  sources: [...SOURCE_IDS],
  categories: [],
  authors: [],
};

export function parsePreferences(raw: string | null | undefined): Preferences {
  if (!raw) return defaultPreferences;
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object") return defaultPreferences;
    const record = value as Record<string, unknown>;
    if (!Array.isArray(record.sources) || !Array.isArray(record.categories) || !Array.isArray(record.authors)) {
      return defaultPreferences;
    }
    const sources = record.sources.filter((item): item is SourceId => typeof item === "string" && isSourceId(item));
    const categories = record.categories.filter(
      (item): item is CategoryId => typeof item === "string" && isCategoryId(item),
    );
    const authors = record.authors
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean);
    if (sources.length === 0) return defaultPreferences;
    if (categories.length !== record.categories.length) return defaultPreferences;
    return { sources, categories, authors };
  } catch {
    return defaultPreferences;
  }
}

export function serializePreferences(preferences: Preferences): string {
  return JSON.stringify({
    sources: preferences.sources.filter((source) => (SOURCE_IDS as readonly string[]).includes(source)),
    categories: preferences.categories.filter((category) =>
      (CATEGORY_IDS as readonly string[]).includes(category),
    ),
    authors: preferences.authors,
  });
}
