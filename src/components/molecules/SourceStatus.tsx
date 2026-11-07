import { Text } from "@chakra-ui/react";

export function SourceStatus({ name, status, message }: { name: string; status: "ok" | "error"; message?: string }) {
  return (
    <Text fontSize="sm" color={status === "error" ? "accent" : "muted"}>
      {message ?? name}
    </Text>
  );
}
