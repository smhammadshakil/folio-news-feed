import { Field, Input } from "@chakra-ui/react";

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
    <Field.Root>
      <Field.Label>Search</Field.Label>
      <Input
        value={value}
        placeholder="Search headlines"
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
    </Field.Root>
  );
}
