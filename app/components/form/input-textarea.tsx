import { getInputProps } from "@conform-to/react";
import { Textarea } from "@mantine/core";

import { InputTextAreaProps } from "./types";

function InputTextarea(params: InputTextAreaProps) {
  const {
    fields,
    label,
    name,
    rows = 4,
    autoComplete = "off",
    ...props
  } = params;

  const field = fields[name];
  const { key, ...inputProps } = getInputProps(field, { type: "text" });

  const { key: _key, ...restProps }: { [key: string]: unknown } = props;
  return (
    <Textarea
      key={key}
      rows={rows}
      styles={{ label: { fontWeight: 600 } }}
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

export default InputTextarea;
