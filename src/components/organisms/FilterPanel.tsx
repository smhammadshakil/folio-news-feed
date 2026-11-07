import { Button, Checkbox, Fieldset, Input, Stack } from "@chakra-ui/react";
import { CATEGORIES, type CategoryId } from "@shared/categories.ts";
import type { ArticleQuery } from "@shared/article.ts";
import type { SourceId } from "@shared/sources.ts";
import { useState } from "react";
import { addDays, dateLabel, localISO } from "../../lib/dates.ts";
import type { SourceCatalogItem } from "../../api/client.ts";

const CATEGORY_IDS = CATEGORIES.map((category) => category.id);

export function FilterPanel({
  query,
  sources,
  onChange,
}: {
  query: ArticleQuery;
  sources: SourceCatalogItem[];
  onChange: (next: ArticleQuery) => void;
}) {
  const today = localISO(new Date());
  const activeDate = dateLabel(query.from, query.to);
  const sourceIds = sources.map((source) => source.id);
  const categoryKey = query.categories.join(",");
  const sourceKey = query.sources.join(",");
  const [categoryHold, setCategoryHold] = useState<{ key: string; draft: CategoryId[] } | null>(null);
  const [sourceHold, setSourceHold] = useState<{ key: string; draft: SourceId[] } | null>(null);
  const categoryDraft = categoryHold?.key === categoryKey ? categoryHold.draft : null;
  const sourceDraft = sourceHold?.key === sourceKey ? sourceHold.draft : null;

  function apply(partial: Partial<ArticleQuery>) {
    onChange({ ...query, ...partial, page: 1 });
  }

  function setPreset(daysBack: number) {
    apply({ from: localISO(addDays(new Date(), -daysBack)), to: today });
  }

  const categoryAll = categoryDraft === null && query.categories.length === 0;
  const shownCategories = categoryDraft ?? query.categories;
  const sourceAll = sourceDraft === null && sourceIds.length > 0 && sourceIds.every((id) => query.sources.includes(id));
  const shownSources = sourceDraft ?? (sourceAll ? [] : query.sources);

  function toggleCategory(id: CategoryId) {
    const current = categoryDraft ?? (categoryAll ? [] : query.categories);
    const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
    if (next.length === 0) {
      setCategoryHold({ key: categoryKey, draft: [] });
      return;
    }
    setCategoryHold(null);
    apply({ categories: next.length === CATEGORY_IDS.length ? [] : next });
  }

  function toggleSource(id: SourceId) {
    const current = sourceDraft ?? (sourceAll ? [] : query.sources);
    const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
    if (next.length === 0) {
      setSourceHold({ key: sourceKey, draft: [] });
      return;
    }
    setSourceHold(null);
    apply({ sources: sourceIds.filter((item) => next.includes(item)) });
  }

  return (
    <Stack gap="6">
      <Fieldset.Root>
        <Fieldset.Legend fontWeight="600">Date</Fieldset.Legend>
        <Fieldset.Content>
          <Stack gap="2">
            <Button size="sm" minH="44px" variant={activeDate === "Today" ? "solid" : "outline"} bg={activeDate === "Today" ? "accent" : undefined} color={activeDate === "Today" ? "accentFg" : "ink"} borderColor="line" onClick={() => setPreset(0)}>
              Today
            </Button>
            <Button size="sm" minH="44px" variant={activeDate === "Last 7 days" ? "solid" : "outline"} bg={activeDate === "Last 7 days" ? "accent" : undefined} color={activeDate === "Last 7 days" ? "accentFg" : "ink"} borderColor="line" onClick={() => setPreset(6)}>
              Last 7 days
            </Button>
            <Button size="sm" minH="44px" variant={activeDate === "Last 30 days" ? "solid" : "outline"} bg={activeDate === "Last 30 days" ? "accent" : undefined} color={activeDate === "Last 30 days" ? "accentFg" : "ink"} borderColor="line" onClick={() => setPreset(29)}>
              Last 30 days
            </Button>
            <Input type="date" aria-label="From" value={query.from ?? ""} borderColor="line" onChange={(event) => apply({ from: event.target.value || undefined })} />
            <Input type="date" aria-label="To" value={query.to ?? ""} borderColor="line" onChange={(event) => apply({ to: event.target.value || undefined })} />
          </Stack>
        </Fieldset.Content>
      </Fieldset.Root>
      <Fieldset.Root>
        <Fieldset.Legend fontWeight="600">Category</Fieldset.Legend>
        <Fieldset.Content>
          <Stack gap="1">
            <Choice label="All" checked={categoryAll} onChange={() => {
              if (categoryAll) {
                setCategoryHold({ key: categoryKey, draft: [] });
                return;
              }
              setCategoryHold(null);
              if (query.categories.length > 0) apply({ categories: [] });
            }} />
            {CATEGORIES.map((category) => (
              <Choice
                key={category.id}
                label={category.label}
                disabled={categoryAll}
                checked={!categoryAll && shownCategories.includes(category.id)}
                onChange={() => toggleCategory(category.id)}
              />
            ))}
          </Stack>
        </Fieldset.Content>
      </Fieldset.Root>
      <Fieldset.Root>
        <Fieldset.Legend fontWeight="600">Source</Fieldset.Legend>
        <Fieldset.Content>
          <Stack gap="1">
            <Choice label="All" checked={sourceAll} onChange={() => {
              if (sourceAll) {
                setSourceHold({ key: sourceKey, draft: [] });
                return;
              }
              setSourceHold(null);
              if (!sourceIds.every((id) => query.sources.includes(id))) apply({ sources: sourceIds });
            }} />
            {sources.map((source) => (
              <Choice
                key={source.id}
                label={source.name}
                disabled={sourceAll}
                checked={!sourceAll && shownSources.includes(source.id)}
                onChange={() => toggleSource(source.id)}
              />
            ))}
          </Stack>
        </Fieldset.Content>
      </Fieldset.Root>
    </Stack>
  );
}

function Choice({
  checked,
  disabled = false,
  onChange,
  label,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <Checkbox.Root checked={checked} disabled={disabled} onCheckedChange={onChange} minH="44px" alignItems="center">
      <Checkbox.HiddenInput />
      <Checkbox.Control />
      <Checkbox.Label>{label}</Checkbox.Label>
    </Checkbox.Root>
  );
}
