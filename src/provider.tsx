import { ChakraProvider } from "@chakra-ui/react";
import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";
import { system } from "./theme/system.ts";

export function Provider({ children }: { children: ReactNode }) {
  return (
    <ChakraProvider value={system}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
        {children}
      </ThemeProvider>
    </ChakraProvider>
  );
}
