import { getInputProps } from "@conform-to/react";
import { PinInput } from "@mantine/core";
import { useMemo } from "react";

import { InputPinProps } from "./types";

function InputPin(params: InputPinProps) {
  const { fields, type, name, size = "sm", ...props } = params;

  const field = fields[name];
  const inputFieldProps = useMemo(
    () => getInputProps(field, { type: type }),
    [field, type],
  );
  return (
    <PinInput
      size={size}
      {...props}
      {...inputFieldProps}
      error={!!field?.errors?.[0] || false}
    />
  );
}

export default InputPin;
