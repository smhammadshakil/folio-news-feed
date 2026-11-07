import { Box, Button, Flex, Heading, Link } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { SearchField } from "../atoms/SearchField.tsx";
import { ColorModeButton } from "./ColorModeButton.tsx";

export function FeedToolbar({
  keyword,
  onKeywordChange,
  onSearchSubmit,
  onOpenFilters,
  onOpenPreferences,
}: {
  keyword: string;
  onKeywordChange: (value: string) => void;
  onSearchSubmit: () => void;
  onOpenFilters: () => void;
  onOpenPreferences: () => void;
}) {
  return (
    <Flex direction={{ base: "column", md: "row" }} gap="3" align={{ md: "end" }} py="4">
      <Heading as="h1" size="xl" fontFamily="heading" lineHeight="1">
        <Link asChild color="ink" _hover={{ textDecoration: "none" }}>
          <RouterLink to="/">Folio</RouterLink>
        </Link>
      </Heading>
      <Box flex="1">
        <SearchField value={keyword} onChange={onKeywordChange} onSubmit={onSearchSubmit} />
      </Box>
      <Flex gap="2" wrap="wrap">
        <Button display={{ base: "inline-flex", lg: "none" }} variant="outline" borderColor="line" minH="44px" onClick={onOpenFilters}>
          Filters
        </Button>
        <Button variant="outline" borderColor="line" minH="44px" onClick={onOpenPreferences}>
          My feed
        </Button>
        <ColorModeButton />
      </Flex>
    </Flex>
  );
}
