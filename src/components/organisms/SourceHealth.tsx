import { Box, Stack } from "@chakra-ui/react";
import type { SourceStatus as SourceStatusType } from "@shared/article.ts";
import { sourceName } from "@shared/sources.ts";
import { SourceStatus } from "../molecules/SourceStatus.tsx";

export function SourceHealth({ sources }: { sources: SourceStatusType[] }) {
  const failed = sources.filter((source) => source.status === "error");
  if (failed.length === 0) return null;
  return (
    <Box role="status" borderWidth="1px" borderColor="line" px="4" py="3" bg="paper">
      <Stack gap="1">
        <Box fontWeight="600">Some sources did not respond.</Box>
        {failed.map((source) => (
          <SourceStatus key={source.id} name={sourceName(source.id)} status={source.status} message={source.message} />
        ))}
      </Stack>
    </Box>
  );
}
