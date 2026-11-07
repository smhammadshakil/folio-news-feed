import { Box, Button, Flex, Heading, Link } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { Logo } from "../atoms/Logo.tsx";
import { SearchField } from "../atoms/SearchField.tsx";
import { ColorModeButton } from "./ColorModeButton.tsx";

export function FeedToolbar({
  keyword,
  onKeywordChange,
  onSearchSubmit,
  onOpenFilters,
  onOpenPreferences,
  showClearFilters,
  onClearFilters,
}: {
  keyword: string;
  onKeywordChange: (value: string) => void;
  onSearchSubmit: () => void;
  onOpenFilters: () => void;
  onOpenPreferences: () => void;
  showClearFilters: boolean;
  onClearFilters: () => void;
}) {
  return (
    <Flex direction="column" gap="3" py="3">
      <Flex align="center" justify="space-between" gap="3">
        <Heading as="h1" size="xl" fontFamily="heading" lineHeight="1">
          <Link asChild color="ink" _hover={{ textDecoration: "none" }}>
            <RouterLink to="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.55rem" }}>
              <Logo />
              Folio
            </RouterLink>
          </Link>
        </Heading>
        <Flex gap="2" align="center" flexShrink="0">
          {showClearFilters ? (
            <Button variant="outline" borderColor="line" minH="44px" onClick={onClearFilters}>
              Clear filters
            </Button>
          ) : null}
          <ColorModeButton />
        </Flex>
      </Flex>
      <Flex gap="2" align="center">
        <Box flex="1">
          <SearchField value={keyword} onChange={onKeywordChange} onSubmit={onSearchSubmit} />
        </Box>
        <Button display={{ base: "inline-flex", lg: "none" }} variant="outline" borderColor="line" minH="44px" onClick={onOpenFilters}>
          Filters
        </Button>
        <Button variant="outline" borderColor="line" minH="44px" onClick={onOpenPreferences}>
          My feed
        </Button>
      </Flex>
    </Flex>
  );
}
