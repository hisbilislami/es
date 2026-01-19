import { getInputProps } from "@conform-to/react";
import { PasswordInput } from "@mantine/core";

import { InputPasswordProps } from "./types";

function InputPassword(params: InputPasswordProps) {
  const {
    fields,
    label,
    name,
    autoComplete = "off",
    size = "sm",
    ...props
  } = params;

  const field = fields[name];

  const { key, ...inputProps } = getInputProps(field, {
    type: "password",
  });
  return (
    <PasswordInput
      size={size}
      key={key}
      styles={{
        label: { fontWeight: 600 },
      }}
      label={label}
      autoComplete={autoComplete}
      {...props}
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

export default InputPassword;
