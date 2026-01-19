import { getInputProps } from "@conform-to/react";
import { TextInput } from "@mantine/core";

import { InputTextProps } from "./types";

function InputText(params: InputTextProps) {
  const {
    fields,
    label,
    name,
    autoComplete = "off",
    size = "sm",
    ...props
  } = params;

  const field = fields[name];
  const { key, ...inputProps } = getInputProps(field, { type: "text" });

  const { key: _key, ...restProps }: { [key: string]: unknown } = props;
  return (
    <TextInput
      key={key}
      size={size}
      styles={{
        label: { fontWeight: 600 },
      }}
      label={label}
      autoComplete={autoComplete}
      {...restProps}
      aria-label={
        typeof label == "string" && !params["aria-label"]
          ? label
          : params["aria-label"]
      }
      {...inputProps}
      error={field?.errors?.[0] || ""}
    />
  );
}

export default InputText;
