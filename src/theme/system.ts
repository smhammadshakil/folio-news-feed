import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const config = defineConfig({
  globalCss: {
    body: {
      bg: "paper",
      color: "ink",
      fontFamily: "body",
    },
  },
  theme: {
    tokens: {
      fonts: {
        heading: { value: '"Newsreader", Georgia, serif' },
        body: { value: '"Source Sans 3", "Segoe UI", sans-serif' },
      },
      colors: {
        paperLight: { value: "#f4f0e6" },
        paperDark: { value: "#161410" },
        inkLight: { value: "#1c1915" },
        inkDark: { value: "#f3efe6" },
        mutedLight: { value: "#5e584e" },
        mutedDark: { value: "#b7b0a4" },
        lineLight: { value: "#e2d9c8" },
        lineDark: { value: "#2c2823" },
        accentLight: { value: "#8f1d2c" },
        accentDark: { value: "#e06a78" },
        accentFgLight: { value: "#fffaf7" },
        accentFgDark: { value: "#1c1915" },
      },
    },
    semanticTokens: {
      colors: {
        paper: { value: { base: "{colors.paperLight}", _dark: "{colors.paperDark}" } },
        ink: { value: { base: "{colors.inkLight}", _dark: "{colors.inkDark}" } },
        muted: { value: { base: "{colors.mutedLight}", _dark: "{colors.mutedDark}" } },
        line: { value: { base: "{colors.lineLight}", _dark: "{colors.lineDark}" } },
        accent: { value: { base: "{colors.accentLight}", _dark: "{colors.accentDark}" } },
        accentFg: { value: { base: "{colors.accentFgLight}", _dark: "{colors.accentFgDark}" } },
      },
    },
  },
});

export const system = createSystem(defaultConfig, config);
