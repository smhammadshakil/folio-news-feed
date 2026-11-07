import { Grid, Skeleton, VisuallyHidden } from "@chakra-ui/react";

export function FeedSkeleton() {
  return (
    <Grid templateColumns={{ base: "1fr", md: "repeat(2, minmax(0, 1fr))" }} gap="6" aria-busy="true">
      <VisuallyHidden>Loading articles</VisuallyHidden>
      {Array.from({ length: 6 }, (_, index) => (
        <Skeleton key={index} height="320px" />
      ))}
    </Grid>
  );
}
