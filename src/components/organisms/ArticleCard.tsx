import { Box, Heading, Image, Stack, Text } from "@chakra-ui/react";
import { useState } from "react";
import type { Article } from "@shared/article.ts";
import { ExternalLink } from "../atoms/ExternalLink.tsx";
import { ArticleMeta } from "../molecules/ArticleMeta.tsx";
import { AuthorLine } from "../molecules/AuthorLine.tsx";

export function ArticleCard({ article }: { article: Article }) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(article.imageUrl) && !imageFailed;
  return (
    <Box as="article" borderWidth="1px" borderColor="line" bg="paper" overflow="hidden">
      {showImage ? (
        <Image
          src={article.imageUrl}
          alt=""
          w="100%"
          aspectRatio="16/9"
          objectFit="cover"
          onError={() => setImageFailed(true)}
        />
      ) : null}
      <Stack p="4" gap="2" align="start">
        <ArticleMeta
          source={article.source}
          sourceName={article.sourceName}
          category={article.category}
          publishedAt={article.publishedAt}
        />
        <Heading as="h2" size="md" fontFamily="heading" lineHeight="1.25">
          <ExternalLink href={article.url}>{article.title}</ExternalLink>
        </Heading>
        {article.summary ? (
          <Text color="ink" lineClamp={2}>
            {article.summary}
          </Text>
        ) : null}
        <AuthorLine author={article.author} />
        <ExternalLink href={article.url}>Read story</ExternalLink>
      </Stack>
    </Box>
  );
}
