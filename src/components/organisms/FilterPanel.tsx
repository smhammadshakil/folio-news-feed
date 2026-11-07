import { Button, Checkbox, Fieldset, Input, Stack } from "@chakra-ui/react";
import { CATEGORIES } from "@shared/categories.ts";
import type { ArticleQuery } from "@shared/article.ts";
import { toggleWithFloor } from "@shared/selection.ts";
import type { SourceId } from "@shared/sources.ts";
import { addDays, dateLabel, localISO } from "../../lib/dates.ts";
import type { SourceCatalogItem } from "../../api/client.ts";
import { IconButton } from "../atoms/IconButton.tsx";

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

  function apply(partial: Partial<ArticleQuery>) {
    onChange({ ...query, ...partial, page: 1 });
  }

  function setPreset(daysBack: number) {
    apply({ from: localISO(addDays(new Date(), -daysBack)), to: today });
  }

  return (
    <Stack gap="6">
      <Fieldset.Root>
        <Fieldset.Legend w="full" display="flex" alignItems="center" justifyContent="space-between" fontWeight="600">
          Date
          <ClearMark label="Clear date" onClick={() => apply({ from: undefined, to: undefined })} />
        </Fieldset.Legend>
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
        <Fieldset.Legend w="full" display="flex" alignItems="center" justifyContent="space-between" fontWeight="600">
          Category
          <ClearMark label="Clear category" onClick={() => apply({ categories: [] })} />
        </Fieldset.Legend>
        <Fieldset.Content>
          <Stack gap="1">
            {CATEGORIES.map((category) => (
              <Choice
                key={category.id}
                label={category.label}
                checked={query.categories.length === 0 || query.categories.includes(category.id)}
                onChange={() =>
                  apply({
                    categories: toggleWithFloor(CATEGORY_IDS, query.categories, category.id, true),
                  })
                }
              />
            ))}
          </Stack>
        </Fieldset.Content>
      </Fieldset.Root>
      <Fieldset.Root>
        <Fieldset.Legend w="full" display="flex" alignItems="center" justifyContent="space-between" fontWeight="600">
          Source
          <ClearMark label="Clear source" onClick={() => apply({ sources: sourceIds })} />
        </Fieldset.Legend>
        <Fieldset.Content>
          <Stack gap="1">
            {sources.map((source) => (
              <Choice
                key={source.id}
                label={source.name}
                checked={query.sources.includes(source.id)}
                onChange={() =>
                  apply({
                    sources: toggleWithFloor(sourceIds, query.sources, source.id, false) as SourceId[],
                  })
                }
              />
            ))}
          </Stack>
        </Fieldset.Content>
      </Fieldset.Root>
    </Stack>
  );
}

function ClearMark({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <IconButton aria-label={label} onClick={onClick} minW="44px" minH="44px" color="accent">
      <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" fill="none">
        <path d="M2 2 L12 12 M12 2 L2 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </IconButton>
  );
}

function Choice({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <Checkbox.Root checked={checked} onCheckedChange={onChange} minH="44px" alignItems="center">
      <Checkbox.HiddenInput />
      <Checkbox.Control />
      <Checkbox.Label>{label}</Checkbox.Label>
    </Checkbox.Root>
  );
}
