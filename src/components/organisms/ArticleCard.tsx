import { Box, Heading, Image, Link, Stack, Text } from "@chakra-ui/react";
import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import type { Article } from "@shared/article.ts";
import { ArticleMeta } from "../molecules/ArticleMeta.tsx";
import { AuthorLine } from "../molecules/AuthorLine.tsx";

export function ArticleCard({ article }: { article: Article }) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(article.imageUrl) && !imageFailed;
  const storyHref = `/story?id=${encodeURIComponent(article.id)}`;
  return (
    <Box as="article" borderWidth="1px" borderColor="line" bg="paper" overflow="hidden">
      {showImage ? (
        <Link asChild>
          <RouterLink to={storyHref}>
            <Image
              src={article.imageUrl}
              alt=""
              w="100%"
              aspectRatio="16/9"
              objectFit="cover"
              onError={() => setImageFailed(true)}
            />
          </RouterLink>
        </Link>
      ) : null}
      <Stack p="4" gap="2" align="start">
        <ArticleMeta
          source={article.source}
          sourceName={article.sourceName}
          category={article.category}
          publishedAt={article.publishedAt}
        />
        <Heading as="h2" size="md" fontFamily="heading" lineHeight="1.25">
          <Link asChild color="ink" _hover={{ textDecoration: "none" }}>
            <RouterLink to={storyHref}>{article.title}</RouterLink>
          </Link>
        </Heading>
        {article.summary ? (
          <Text color="ink" lineClamp={2}>
            {article.summary}
          </Text>
        ) : null}
        <AuthorLine author={article.author} />
        <Link asChild color="accent">
          <RouterLink to={storyHref}>Open the story</RouterLink>
        </Link>
      </Stack>
    </Box>
  );
}
