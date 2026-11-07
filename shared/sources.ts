export const SOURCE_IDS = ["guardian", "nyt", "newsapi"] as const;

export type SourceId = (typeof SOURCE_IDS)[number];

export type SourceInfo = {
  id: SourceId;
  name: string;
  categories: string[];
};

export const SOURCE_CATALOG: { id: SourceId; name: string }[] = [
  { id: "guardian", name: "The Guardian" },
  { id: "nyt", name: "The New York Times" },
  { id: "newsapi", name: "NewsAPI" },
];

export function isSourceId(value: string): value is SourceId {
  return (SOURCE_IDS as readonly string[]).includes(value);
}

export function sourceName(id: SourceId): string {
  return SOURCE_CATALOG.find((source) => source.id === id)?.name ?? id;
}
