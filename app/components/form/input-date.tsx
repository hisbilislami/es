import { getInputProps, useInputControl } from "@conform-to/react";
import { DateInput } from "@mantine/dates";
import dayjs from "dayjs";

import { InputDateProps } from "./types";

function InputDate(params: InputDateProps) {
  const {
    fields,
    label,
    name,
    autoComplete = "off",
    size = "sm",
    ...props
  } = params;

  const field = fields[name];
  const { key, ...fieldProps } = getInputProps(field, { type: "text" });

  const fieldControl = useInputControl(
    field as { initialValue?: string; name: string; formId: string },
  );

  const getDefaultValue = () => {
    if (!fieldProps.defaultValue) return undefined;

    return new Date(fieldProps.defaultValue);
  };

  const getValue = () => {
    if (!fieldControl.value) return undefined;
    return new Date(fieldControl.value);
  };

  return (
    <DateInput
      key={key}
      size={size}
      styles={{
        label: { fontWeight: 600 },
      }}
      label={label}
      valueFormat="DD MMMM YYYY"
      autoComplete={autoComplete}
      {...props}
      aria-label={
        typeof label == "string" && !params["aria-label"]
          ? label
          : params["aria-label"]
      }
      {...fieldProps}
      defaultValue={getDefaultValue()}
      value={getValue()}
      onChange={(val) => {
        fieldControl.change(String(val));
      }}
      error={field?.errors?.[0] || ""}
    />
  );
}

export default InputDate;
