import { Button, EmptyState } from "@chakra-ui/react";

export function EmptyFeed({ onResetFilters }: { onResetFilters: () => void }) {
  return (
    <EmptyState.Root>
      <EmptyState.Content>
        <EmptyState.Title>Nothing matches this feed</EmptyState.Title>
        <EmptyState.Description>
          Try a broader keyword, or clear the date, category, and source filters.
        </EmptyState.Description>
        <Button mt="4" bg="accent" color="accentFg" minH="44px" onClick={onResetFilters}>
          Clear filters
        </Button>
      </EmptyState.Content>
    </EmptyState.Root>
  );
}
