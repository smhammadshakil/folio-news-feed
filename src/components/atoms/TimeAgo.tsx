import { Text } from "@chakra-ui/react";

export function TimeAgo({ publishedAt }: { publishedAt: string }) {
  const date = new Date(publishedAt);
  if (Number.isNaN(date.getTime())) return null;
  const diffMs = date.getTime() - Date.now();
  const minutes = Math.round(diffMs / 60000);
  const absDays = Math.abs(diffMs) / 86400000;
  const label =
    absDays > 7
      ? new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(date)
      : new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(
          Math.abs(minutes) < 60 ? minutes : Math.abs(minutes) < 1440 ? Math.round(minutes / 60) : Math.round(minutes / 1440),
          Math.abs(minutes) < 60 ? "minute" : Math.abs(minutes) < 1440 ? "hour" : "day",
        );
  return (
    <Text asChild color="muted" fontSize="sm">
      <time dateTime={publishedAt}>{label}</time>
    </Text>
  );
}
