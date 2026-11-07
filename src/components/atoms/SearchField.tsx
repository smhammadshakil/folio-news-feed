import { Input } from "@chakra-ui/react";

export function SearchField({
  value,
  onChange,
  onSubmit,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}) {
  return (
    <Input
      aria-label="Search"
      value={value}
      placeholder="Search headlines"
      maxLength={200}
      bg="paper"
      borderColor="line"
      onChange={(event) => onChange(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          onSubmit();
        }
      }}
    />
  );
}
