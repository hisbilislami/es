import { getInputProps } from "@conform-to/react";
import { NumberInput } from "@mantine/core";

import { InputNumberProps } from "./types";

function InputNumber(params: InputNumberProps) {
  const {
    fields,
    label,
    name,
    size = "sm",
    autoComplete = "off",
    ...props
  } = params;

  const field = fields[name];
  const { key, min, max, step, ...inputProps } = getInputProps(field, {
    type: "text",
  });

  const extraProps: Record<string, unknown> = {};
  if (min) extraProps.min = Number(min);
  if (max) extraProps.max = Number(max);
  if (step) extraProps.step = Number(step);

  return (
    <NumberInput
      size={size}
      key={key}
      {...extraProps}
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

export default InputNumber;
