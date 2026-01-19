import { FieldMetadata } from "@conform-to/react";
import {
  CheckboxProps,
  ComboboxItem,
  FileButtonProps,
  NumberInputProps,
  PasswordInputProps,
  RadioGroupProps,
  PinInputProps,
  SelectProps,
  TextInputProps,
  CheckboxGroupProps,
  MultiSelectProps,
  ComboboxProps,
  TextareaProps,
} from "@mantine/core";
import { DateInputProps } from "@mantine/dates";
import { Record } from "@prisma/client/runtime/library";
import { UseFormReturnType } from "@mantine/form";
import { ReactElement, ReactNode } from "react";

export type InputTextProps = Omit<
  TextInputProps,
  "name" | "styles" | "form"
> & {
  name: string;
  fields: Record<string, FieldMetadata>;
};

export type InputNumberProps = Omit<
  NumberInputProps,
  "name" | "styles" | "form"
> & {
  name: string;
  fields: Record<string, FieldMetadata>;
};

export type InputPasswordProps = Omit<
  PasswordInputProps,
  "name" | "styles" | "form"
> & {
  name: string;
  fields: Record<string, FieldMetadata>;
};

export type InputCheckboxProps = Omit<
  CheckboxProps,
  "name" | "styles" | "form"
> & {
  name: string;
  fields: Record<string, FieldMetadata>;
};

export type InputBooleanCheckboxProps = Omit<
  CheckboxProps,
  "name" | "styles" | "form"
> & {
  name: string;
  defaultChecked?: boolean;
};

export type InputRadioGroupProps = Omit<
  RadioGroupProps,
  "name" | "styles" | "form"
> & {
  name: string;
  children?: ReactNode;
  fields: Record<string, FieldMetadata>;
};

export type InputSelectProps<TParams> = Omit<
  SelectProps,
  "name" | "styles" | "form"
> & {
  name: string;
  fields: Record<string, FieldMetadata>;
  loading?: boolean;
  searchable?: boolean;
  remountKey?: string;
  dataFetch?: {
    urlPath: string;
    keys: { label: string | string[]; value: string };
    dataKeys?: string;
    disabledRowByValues?: string[];
    hiddenRowByValues?: string[];
    initialValue?: ComboboxItem;
    params?: TParams;
  };
  skipLimit?: boolean;
};

export type InputSelect2Props<TParams, TItem = unknown> = Omit<
  ComboboxProps,
  "name" | "styles" | "form"
> & {
  name: string;
  loading?: boolean;
  label: string;
  searchable?: boolean;
  defaultValue?: string | null;
  remountKey?: string;
  dataFetch?: {
    urlPath: string;
    dataKeys?: string;
    disabledRowByValues?: string[];
    hiddenRowByValues?: string[];
    initialValue?: ComboboxItem;
    params?: TParams;
  };
  skipLimit?: boolean;
  valueField: string;
  displayField: string;
  onChange?: (
    value: string | null,
    option: {
      value: string;
      label: string;
      record: TItem;
    },
  ) => void;
};

export type InputFileButtonProps = Omit<
  FileButtonProps,
  "name" | "form" | "children" | "onChange"
> & {
  name: string;
  fields: Record<string, FieldMetadata>;
  loading?: boolean;
  label?: string;
  emptyLabel: boolean;
  actionText?: string;
  onChange?: (payload: File | null) => void;
  onSuccess?: ({ id, key }: { id: number; key: string }) => void;
  dataKeys: Record<"id" | "path", string>;
  group?: string;
  children?: ReactElement;
};

export type InputDateProps = Omit<
  DateInputProps,
  "name" | "form" | "styles"
> & {
  name: string;
  fields: Record<string, FieldMetadata>;
};

export type InputPinProps = Omit<PinInputProps, "name" | "styles" | "form"> & {
  name: string;
  fields: Record<string, FieldMetadata>;
};

export type InputMultiSelectProps<TParams> = Omit<
  MultiSelectProps,
  "name" | "styles" | "form"
> & {
  name: string;
  fields: Record<string, FieldMetadata>;
  loading?: boolean;
  dataFetch?: {
    urlPath: string;
    keys: { label: string | string[]; value: string };
    dataKeys?: string;
    disabledRowByValues?: string[];
    hiddenRowByValues?: string[];
    initialValue?: ComboboxItem;
    params?: TParams;
  };
};

export type InputTextAreaProps = Omit<
  TextareaProps,
  "name" | "size" | "styles" | "form"
> & {
  name: string;
  fields: Record<string, FieldMetadata>;
};

export type InputComboBoxProps<TParams> = Omit<
  SelectProps,
  "name" | "styles" | "form"
> & {
  name: string;
  fields: Record<string, FieldMetadata>;
  loading?: boolean;
  searchable?: boolean;
  remountKey?: string;
  dataFetch?: {
    urlPath: string;
    keys: { label: string | string[]; value: string };
    dataKeys?: string;
    disabledRowByValues?: string[];
    hiddenRowByValues?: string[];
    initialValue?: ComboboxItem;
    params?: TParams;
  };
  skipLimit?: boolean;
};
