import { Flex, Input, Stack } from "@chakra-ui/react";
import { useState } from "react";
import { FilterChip } from "./FilterChip.tsx";

export function AuthorTagInput({ authors, onChange }: { authors: string[]; onChange: (authors: string[]) => void }) {
  const [draft, setDraft] = useState("");

  function add() {
    const name = draft.trim();
    if (!name) return;
    if (!authors.some((author) => author.toLowerCase() === name.toLowerCase())) {
      onChange([...authors, name]);
    }
    setDraft("");
  }

  return (
    <Stack gap="2">
      <Input
        value={draft}
        placeholder="Add an author"
        aria-label="Author name"
        borderColor="line"
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            add();
          }
        }}
      />
      <Flex gap="2" wrap="wrap">
        {authors.map((author) => (
          <FilterChip key={author} label={author} onRemove={() => onChange(authors.filter((item) => item !== author))} />
        ))}
      </Flex>
    </Stack>
  );
}
