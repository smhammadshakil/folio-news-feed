import { Text } from "@chakra-ui/react";

export function ResultCount({ count, mode }: { count: number; mode: "fixture" | "live" }) {
  return (
    <Text color="muted" aria-live="polite">
      {count} {count === 1 ? "story" : "stories"}
      {mode === "fixture" ? " · Sample data" : ""}
    </Text>
  );
}
