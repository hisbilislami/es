import { getInputProps } from "@conform-to/react";
import { Checkbox } from "@mantine/core";

import { InputCheckboxProps } from "./types";

function InputCheckbox(params: InputCheckboxProps) {
  const { fields, label, name, size = "sm", ...props } = params;

  const field = fields[name];
  return (
    <Checkbox
      size={size}
      label={label}
      {...props}
      aria-label={
        typeof label == "string" && !params["aria-label"]
          ? label
          : params["aria-label"]
      }
      {...getInputProps(field, { type: "checkbox" })}
      error={field?.errors?.[0] || ""}
    />
  );
}

export default InputCheckbox;
