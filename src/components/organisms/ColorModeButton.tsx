import { useTheme } from "next-themes";
import { IconButton } from "../atoms/IconButton.tsx";

export function ColorModeButton() {
  const { resolvedTheme, setTheme } = useTheme();
  const dark = resolvedTheme === "dark";
  return (
    <IconButton
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(dark ? "light" : "dark")}
      minH="44px"
    >
      {dark ? "Light" : "Dark"}
    </IconButton>
  );
}
