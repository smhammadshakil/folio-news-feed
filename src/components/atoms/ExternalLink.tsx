import { Link, VisuallyHidden } from "@chakra-ui/react";
import type { ReactNode } from "react";

export function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} target="_blank" rel="noopener noreferrer" color="accent">
      {children}
      <VisuallyHidden>, opens in a new tab</VisuallyHidden>
    </Link>
  );
}
