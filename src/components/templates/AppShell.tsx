import { Box, Stack } from "@chakra-ui/react";
import type { ReactNode } from "react";

export function AppShell({
  toolbar,
  sidebar,
  banner,
  main,
}: {
  toolbar: ReactNode;
  sidebar: ReactNode;
  banner?: ReactNode;
  main: ReactNode;
}) {
  return (
    <Box minH="100vh" bg="paper" color="ink">
      <Box position="sticky" top="0" zIndex="10" bg="paper" borderBottomWidth="1px" borderColor="line">
        <Box maxW="1120px" mx="auto" px={{ base: 4, md: 8 }}>
          {toolbar}
        </Box>
      </Box>
      <Box maxW="1120px" mx="auto" px={{ base: 4, md: 8 }} py="6">
        <Stack gap="4" mb="4">
          {banner}
        </Stack>
        <Box display="grid" gridTemplateColumns={{ base: "1fr", lg: "280px 1fr" }} gap="8">
          <Box display={{ base: "none", lg: "block" }}>{sidebar}</Box>
          <Box minW="0">{main}</Box>
        </Box>
      </Box>
    </Box>
  );
}
