import { Badge } from "@chakra-ui/react";
import { categoryLabel, type CategoryId } from "@shared/categories.ts";

export function CategoryBadge({ category }: { category?: CategoryId }) {
  if (!category) return null;
  return (
    <Badge variant="outline" borderColor="line" color="muted" borderRadius="sm">
      {categoryLabel(category)}
    </Badge>
  );
}
