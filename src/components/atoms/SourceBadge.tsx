import { Badge } from "@chakra-ui/react";
import type { SourceId } from "@shared/sources.ts";

const palette: Record<SourceId, { bg: string; color: string }> = {
  guardian: { bg: "ink", color: "paper" },
  nyt: { bg: "accent", color: "accentFg" },
  newsapi: { bg: "blue.800", color: "white" },
};

export function SourceBadge({ source, name }: { source: SourceId; name: string }) {
  const colors = palette[source];
  return (
    <Badge bg={colors.bg} color={colors.color} borderRadius="sm" px="2" py="0.5">
      {name}
    </Badge>
  );
}
