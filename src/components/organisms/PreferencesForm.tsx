import { Button, Checkbox, Fieldset, Stack } from "@chakra-ui/react";
import { CATEGORIES } from "@shared/categories.ts";
import type { Preferences } from "@shared/preferences.ts";
import { toggleWithFloor } from "@shared/selection.ts";
import type { SourceId } from "@shared/sources.ts";
import type { SourceCatalogItem } from "../../api/client.ts";
import { AuthorTagInput } from "../molecules/AuthorTagInput.tsx";

const CATEGORY_IDS = CATEGORIES.map((category) => category.id);

export function PreferencesForm({
  value,
  sources,
  onChange,
  onSave,
  onReset,
  saving,
}: {
  value: Preferences;
  sources: SourceCatalogItem[];
  onChange: (next: Preferences) => void;
  onSave: () => void;
  onReset: () => void;
  saving: boolean;
}) {
  const sourceIds = sources.map((source) => source.id);
  return (
    <Stack gap="6">
      <Fieldset.Root>
        <Fieldset.Legend fontWeight="600">Sources</Fieldset.Legend>
        <Fieldset.Content>
          <Stack gap="1">
            {sources.map((source) => (
              <Checkbox.Root
                key={source.id}
                checked={value.sources.includes(source.id)}
                minH="44px"
                alignItems="center"
                onCheckedChange={() =>
                  onChange({
                    ...value,
                    sources: toggleWithFloor(sourceIds, value.sources, source.id, false) as SourceId[],
                  })
                }
              >
                <Checkbox.HiddenInput />
                <Checkbox.Control />
                <Checkbox.Label>{source.name}</Checkbox.Label>
              </Checkbox.Root>
            ))}
          </Stack>
        </Fieldset.Content>
      </Fieldset.Root>
      <Fieldset.Root>
        <Fieldset.Legend fontWeight="600">Categories</Fieldset.Legend>
        <Fieldset.Content>
          <Stack gap="1">
            {CATEGORIES.map((category) => (
              <Checkbox.Root
                key={category.id}
                checked={value.categories.length === 0 || value.categories.includes(category.id)}
                minH="44px"
                alignItems="center"
                onCheckedChange={() =>
                  onChange({
                    ...value,
                    categories: toggleWithFloor(CATEGORY_IDS, value.categories, category.id, true),
                  })
                }
              >
                <Checkbox.HiddenInput />
                <Checkbox.Control />
                <Checkbox.Label>{category.label}</Checkbox.Label>
              </Checkbox.Root>
            ))}
          </Stack>
        </Fieldset.Content>
      </Fieldset.Root>
      <Fieldset.Root>
        <Fieldset.Legend fontWeight="600">Authors</Fieldset.Legend>
        <Fieldset.Content>
          <AuthorTagInput authors={value.authors} onChange={(authors) => onChange({ ...value, authors })} />
        </Fieldset.Content>
      </Fieldset.Root>
      <Stack direction="row" gap="2">
        <Button bg="accent" color="accentFg" minH="44px" disabled={saving} onClick={onSave}>
          Save feed
        </Button>
        <Button variant="ghost" minH="44px" disabled={saving} onClick={onReset}>
          Reset
        </Button>
      </Stack>
    </Stack>
  );
}
