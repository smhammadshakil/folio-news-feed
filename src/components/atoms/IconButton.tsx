import { IconButton as ChakraIconButton, type IconButtonProps } from "@chakra-ui/react";

type IconButtonAtomProps = Omit<IconButtonProps, "aria-label"> & { "aria-label": string };

export function IconButton(props: IconButtonAtomProps) {
  return <ChakraIconButton variant="ghost" color="ink" {...props} />;
}
