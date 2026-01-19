import {
  FieldMetadata,
  getInputProps,
  useInputControl,
} from "@conform-to/react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { FileButton, Button, Flex } from "@mantine/core";
import { useFetcher } from "@remix-run/react";
import { cloneElement, useEffect } from "react";

import { action } from "~/routes/api/upload/route";

import { InputFileButtonProps } from "./types";

function InputFileButton(params: InputFileButtonProps) {
  const {
    name,
    fields,
    label,
    emptyLabel = true,
    actionText = "Unggah",
    accept = "image/png,image/jpeg",
    onChange = () => {},
    onSuccess = () => {},
    dataKeys,
    group = "ktp",
    children,
    ...rest
  } = params;
  const field = fields[name];
  const fieldIdControl = useInputControl(
    fields[dataKeys["id"]] as FieldMetadata<string>,
  );
  const fieldPathControl = useInputControl(
    fields[dataKeys["path"]] as FieldMetadata<string>,
  );

  const fetcher = useFetcher<typeof action>();

  const handleUpload = async (file: File | null) => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    fetcher.submit(formData, {
      method: "POST",
      action: `/api/upload?file-group=${group}`,
      encType: "multipart/form-data",
    });
  };

  useEffect(() => {
    if (fetcher.data && fetcher.data.success && fetcher.data.data) {
      fieldIdControl.change(fetcher.data.data.id.toString());
      fieldPathControl.change(fetcher.data.data.key);

      if (typeof onSuccess === "function") {
        onSuccess(fetcher.data.data);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(fetcher.data)]);

  const { key, ...inputProps } = getInputProps(field, { type: "file" });

  return (
    <Flex direction="column" gap={4}>
      {label ? <label className="text-sm font-semibold">{label}</label> : null}
      {emptyLabel ? <span className="w-full h-5"></span> : null}
      <FileButton
        key={key}
        inputProps={{ ...inputProps }}
        name={name}
        accept={accept}
        {...rest}
        onChange={(file) => {
          if (typeof onChange === "function") {
            onChange(file);
          }

          handleUpload(file);
        }}
      >
        {(props) => {
          // eslint-disable-next-line react/prop-types, @typescript-eslint/no-unused-vars
          const { key: _key, ...restProps }: { [key: string]: unknown } = props;

          return children ? (
            cloneElement(children, restProps)
          ) : (
            <Button
              size="sm"
              {...restProps}
              className="font-normal text-sm mt-[1px]"
              variant="default"
              rightSection={<Icon icon="tabler:upload" className="h-4 w-4" />}
              loading={fetcher.state !== "idle"}
            >
              {actionText}
            </Button>
          );
        }}
      </FileButton>
    </Flex>
  );
}

export default InputFileButton;
