export const CATEGORY_IDS = [
  "world",
  "politics",
  "business",
  "technology",
  "science",
  "health",
  "sports",
  "culture",
  "opinion",
] as const;

export type CategoryId = (typeof CATEGORY_IDS)[number];

export const CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: "world", label: "World" },
  { id: "politics", label: "Politics" },
  { id: "business", label: "Business" },
  { id: "technology", label: "Technology" },
  { id: "science", label: "Science" },
  { id: "health", label: "Health" },
  { id: "sports", label: "Sports" },
  { id: "culture", label: "Culture" },
  { id: "opinion", label: "Opinion" },
];

export function isCategoryId(value: string): value is CategoryId {
  return (CATEGORY_IDS as readonly string[]).includes(value);
}

export function categoryLabel(id: CategoryId): string {
  return CATEGORIES.find((category) => category.id === id)?.label ?? id;
}

const GUARDIAN_SECTION: Record<CategoryId, string> = {
  world: "world",
  politics: "politics",
  business: "business",
  technology: "technology",
  science: "science",
  health: "society",
  sports: "sport",
  culture: "culture",
  opinion: "commentisfree",
};

const NYT_DESKS: Record<CategoryId, string[]> = {
  world: ["World"],
  politics: ["Politics", "U.S."],
  business: ["Business", "Financial"],
  technology: ["Technology"],
  science: ["Science"],
  health: ["Health", "Well"],
  sports: ["Sports"],
  culture: ["Arts", "Style", "Food"],
  opinion: ["Opinion", "OpEd"],
};

const NEWSAPI_CATEGORY: Partial<Record<CategoryId, string>> = {
  business: "business",
  health: "health",
  science: "science",
  sports: "sports",
  technology: "technology",
};

export function guardianSection(category: CategoryId): string {
  return GUARDIAN_SECTION[category];
}

export function categoryFromGuardianSection(sectionId: string): CategoryId | undefined {
  const match = (Object.entries(GUARDIAN_SECTION) as [CategoryId, string][]).find(
    ([, section]) => section === sectionId,
  );
  return match?.[0];
}

export function nytNewsDeskFilter(categories: CategoryId[]): string | undefined {
  const desks = categories.flatMap((category) => NYT_DESKS[category]);
  if (desks.length === 0) return undefined;
  return `news_desk:(${desks.map((desk) => `"${desk}"`).join(" ")})`;
}

export function categoryFromNytDesk(desk: string | undefined): CategoryId | undefined {
  if (!desk) return undefined;
  const match = (Object.entries(NYT_DESKS) as [CategoryId, string[]][]).find(([, desks]) =>
    desks.includes(desk),
  );
  return match?.[0];
}

export function newsApiCategory(category: CategoryId): string | undefined {
  return NEWSAPI_CATEGORY[category];
}
