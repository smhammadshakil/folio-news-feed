import { Flex } from "@chakra-ui/react";
import { categoryLabel } from "@shared/categories.ts";
import type { ArticleQuery } from "@shared/article.ts";
import { SOURCE_IDS, sourceName } from "@shared/sources.ts";
import { dateLabel } from "../../lib/dates.ts";
import { FilterChip } from "../molecules/FilterChip.tsx";

export function ActiveFilters({ query, onChange }: { query: ArticleQuery; onChange: (next: ArticleQuery) => void }) {
  const when = dateLabel(query.from, query.to);
  const chips: { key: string; label: string; clear: () => void }[] = [];
  if (query.q) chips.push({ key: "q", label: query.q, clear: () => onChange({ ...query, q: undefined, page: 1 }) });
  if (when) {
    chips.push({
      key: "date",
      label: when,
      clear: () => onChange({ ...query, from: undefined, to: undefined, page: 1 }),
    });
  }
  for (const category of query.categories) {
    chips.push({
      key: category,
      label: categoryLabel(category),
      clear: () =>
        onChange({
          ...query,
          categories: query.categories.filter((item) => item !== category),
          page: 1,
        }),
    });
  }
  if (query.sources.length < SOURCE_IDS.length) {
    for (const source of query.sources) {
      chips.push({
        key: source,
        label: sourceName(source),
        clear: () => {
          const sources = query.sources.filter((item) => item !== source);
          onChange({
            ...query,
            sources: sources.length === 0 ? [...SOURCE_IDS] : sources,
            page: 1,
          });
        },
      });
    }
  }
  for (const author of query.authors) {
    chips.push({
      key: `author-${author}`,
      label: author,
      clear: () => onChange({ ...query, authors: query.authors.filter((item) => item !== author), page: 1 }),
    });
  }
  if (chips.length === 0) return null;
  return (
    <Flex gap="2" wrap="wrap">
      {chips.map((chip) => (
        <FilterChip key={chip.key} label={chip.label} onRemove={chip.clear} />
      ))}
    </Flex>
  );
}
