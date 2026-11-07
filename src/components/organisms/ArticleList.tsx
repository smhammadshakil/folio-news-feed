import { Grid } from "@chakra-ui/react";
import type { Article } from "@shared/article.ts";
import { ArticleCard } from "./ArticleCard.tsx";

export function ArticleList({ articles }: { articles: Article[] }) {
  return (
    <Grid templateColumns={{ base: "1fr", md: "repeat(2, minmax(0, 1fr))" }} gap="6">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </Grid>
  );
}
