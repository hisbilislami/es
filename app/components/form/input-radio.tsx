import { getInputProps } from "@conform-to/react";
import { Group, Radio } from "@mantine/core";

import { InputRadioGroupProps } from "./types";

function InputRadio(params: InputRadioGroupProps) {
  const { fields, label, name, size = "sm", children, ...props } = params;

  const field = fields[name];

  return (
    <Radio.Group
      size={size}
      label={label}
      {...props}
      aria-label={
        typeof label == "string" && !params["aria-label"]
          ? label
          : params["aria-label"]
      }
      {...getInputProps(field, { type: "radio", value: false })}
      error={field?.errors?.[0] || ""}
    >
      <Group my="xs">{children}</Group>
    </Radio.Group>
  );
}

export default InputRadio;
