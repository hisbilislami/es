import { Checkbox } from "@mantine/core";

import { InputBooleanCheckboxProps } from "./types";

function InputBooleanCheckbox(params: InputBooleanCheckboxProps) {
  const {
    label,
    name,
    size = "sm",
    defaultChecked,
    checked,
    onChange,
    ...props
  } = params;

  return (
    <>
      <input type="hidden" name={name} value={checked ? "true" : ""} />
      <Checkbox checked={checked} onChange={onChange} size={size} {...props} />
    </>
  );
}

export default InputBooleanCheckbox;
