import { Text } from "@chakra-ui/react";

export function AuthorLine({ author }: { author?: string }) {
  if (!author) return null;
  return (
    <Text color="muted" fontSize="sm">
      By {author}
    </Text>
  );
}
