import { Flex } from "@chakra-ui/react";
import type { CategoryId } from "@shared/categories.ts";
import type { SourceId } from "@shared/sources.ts";
import { CategoryBadge } from "../atoms/CategoryBadge.tsx";
import { SourceBadge } from "../atoms/SourceBadge.tsx";
import { TimeAgo } from "../atoms/TimeAgo.tsx";

export function ArticleMeta({
  source,
  sourceName,
  category,
  publishedAt,
}: {
  source: SourceId;
  sourceName: string;
  category?: CategoryId;
  publishedAt: string;
}) {
  return (
    <Flex gap="2" align="center" wrap="wrap">
      <SourceBadge source={source} name={sourceName} />
      <CategoryBadge category={category} />
      <TimeAgo publishedAt={publishedAt} />
    </Flex>
  );
}
