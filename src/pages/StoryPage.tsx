import { Box, Heading, Image, Link, Stack, Text } from "@chakra-ui/react";
import type { ArticleDetail, StoryImage } from "@shared/article.ts";
import { categoryLabel } from "@shared/categories.ts";
import { useEffect, useState } from "react";
import { Link as RouterLink, useSearchParams } from "react-router-dom";
import { ApiError } from "../api/client.ts";
import { ExternalLink } from "../components/atoms/ExternalLink.tsx";
import { ColorModeButton } from "../components/organisms/ColorModeButton.tsx";

type StoryStatus = "loading" | "ready" | "failed";

export function StoryPage() {
  const [params] = useSearchParams();
  const id = params.get("id")?.trim() ?? "";
  const [story, setStory] = useState<ArticleDetail | null>(null);
  const [status, setStatus] = useState<StoryStatus>("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setStatus("failed");
      setError("This story is not on the page.");
      return;
    }
    const controller = new AbortController();
    setStatus("loading");
    setError(null);
    const run = async () => {
      try {
        const response = await fetch(`/api/article?id=${encodeURIComponent(id)}`, { signal: controller.signal });
        if (!response.ok) {
          let message = "The story did not load";
          try {
            const body = (await response.json()) as { error?: string };
            if (body.error) message = body.error;
          } catch {
            // Keep the fallback when the body is not JSON.
          }
          throw new ApiError(response.status, message);
        }
        const detail = (await response.json()) as ArticleDetail;
        setStory(detail);
        setStatus("ready");
        document.title = `Folio · ${detail.title}`;
      } catch (caught) {
        if (controller.signal.aborted) return;
        setStory(null);
        setError(caught instanceof Error ? caught.message : "The story did not load");
        setStatus("failed");
      }
    };
    void run();
    return () => controller.abort();
  }, [id]);

  return (
    <Box minH="100vh" bg="paper" color="ink">
      <Box maxW="760px" mx="auto" px={{ base: 4, md: 6 }} py="6">
        <Stack direction="row" justify="space-between" align="center" mb="5">
          <Link asChild color="ink" fontSize="sm">
            <RouterLink to="/">Back to the desk</RouterLink>
          </Link>
          <ColorModeButton />
        </Stack>
        {status === "loading" ? <StorySkeleton /> : null}
        {status === "failed" ? (
          <Stack gap="3" py="10">
            <Heading as="h1" size="xl" fontFamily="heading">
              The story did not load
            </Heading>
            <Text>{error}</Text>
          </Stack>
        ) : null}
        {status === "ready" && story ? <NewspaperStory story={story} /> : null}
      </Box>
    </Box>
  );
}

function NewspaperStory({ story }: { story: ArticleDetail }) {
  const kicker = [story.category ? categoryLabel(story.category) : "", story.sourceName].filter(Boolean).join("  ·  ");
  const when = editionDate(story.publishedAt);
  const paragraphs = story.paragraphs.length > 0 ? story.paragraphs : story.summary ? [story.summary] : [];
  const extras = story.images.slice(1);
  return (
    <Box as="article">
      <Box borderTopWidth="4px" borderBottomWidth="1px" borderColor="ink" py="3" textAlign="center">
        <Text fontFamily="heading" letterSpacing="0.34em" fontSize="lg">
          FOLIO
        </Text>
        {when ? (
          <Text fontSize="sm" color="muted" mt="1">
            {when}
          </Text>
        ) : null}
      </Box>
      <Box borderTopWidth="1px" borderColor="ink" mt="1" mb="6" />
      <Text fontSize="xs" letterSpacing="0.16em" textTransform="uppercase" color="accent">
        {kicker}
      </Text>
      <Heading as="h1" mt="3" fontFamily="heading" fontSize={{ base: "2.35rem", md: "3.35rem" }} lineHeight="1.02" fontWeight="600">
        {story.title}
      </Heading>
      {story.summary ? (
        <Text mt="4" fontFamily="heading" fontSize={{ base: "lg", md: "xl" }} fontStyle="italic" lineHeight="1.35" color="muted">
          {story.summary}
        </Text>
      ) : null}
      <Text mt="4" py="2" fontSize="sm" borderTopWidth="1px" borderBottomWidth="1px" borderColor="line">
        {story.author ? `By ${story.author}` : story.sourceName}
        {when ? ` — ${when}` : ""}
      </Text>
      {story.images[0] ? <StoryFigure image={story.images[0]} /> : null}
      <Stack gap="4" mt="5">
        {paragraphs.map((paragraph, index) => (
          <Box key={`${index}-${paragraph.slice(0, 24)}`}>
            <Text fontFamily="heading" fontSize="lg" lineHeight="1.55" textAlign="justify">
              {index === 0 && paragraph.length > 1 ? (
                <Box as="span" float="left" fontSize="4.4rem" lineHeight="0.78" pr="2" pt="1" fontWeight="600">
                  {paragraph[0]}
                </Box>
              ) : null}
              {index === 0 && paragraph.length > 1 ? paragraph.slice(1) : paragraph}
            </Text>
            {extras[index] ? <StoryFigure image={extras[index]} /> : null}
          </Box>
        ))}
      </Stack>
      <Box mt="8" pt="4" borderTopWidth="4px" borderColor="ink" textAlign="center">
        <ExternalLink href={story.url}>Continue at {story.sourceName}</ExternalLink>
      </Box>
    </Box>
  );
}

function StoryFigure({ image }: { image: StoryImage }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return (
    <Box as="figure" my="6">
      <Image src={image.url} alt={image.caption ?? ""} w="100%" maxH="520px" objectFit="cover" onError={() => setFailed(true)} />
      {image.caption ? (
        <Text as="figcaption" mt="2" textAlign="center" fontFamily="heading" fontStyle="italic" fontSize="sm" color="muted">
          {image.caption}
        </Text>
      ) : null}
    </Box>
  );
}

function StorySkeleton() {
  return (
    <Stack gap="4" py="6">
      <Box h="16px" bg="line" />
      <Box h="72px" bg="line" />
      <Box h="240px" bg="line" />
      <Box h="16px" bg="line" />
      <Box h="16px" bg="line" />
    </Stack>
  );
}

function editionDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}
