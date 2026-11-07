import { Button, VisuallyHidden } from "@chakra-ui/react";

export function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <Button size="sm" variant="outline" borderColor="line" color="ink" minH="44px" onClick={onRemove}>
      {label}
      <span aria-hidden="true"> ×</span>
      <VisuallyHidden>Remove {label}</VisuallyHidden>
    </Button>
  );
}
