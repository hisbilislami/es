import { getInputProps, useInputControl } from "@conform-to/react";
import { ComboboxItem, Loader, MultiSelect } from "@mantine/core";
import { useDidUpdate } from "@mantine/hooks";
import cuid2 from "@paralleldrive/cuid2";
import { useFetcher } from "@remix-run/react";
import { useEffect, useState, useRef } from "react";

import { mergeArrays } from "~/utils/array-helper";

import { InputMultiSelectProps } from "./types";
import { useDialog } from "~/context/DialogContext";

export type QueryParamType = {
  search?: string;
  page: number;
  limit: number;
};

function InputMultiSelect<TLoader, TParams = Record<string, unknown>>(
  params: InputMultiSelectProps<TParams>,
) {
  const {
    rightSection,
    fields,
    label,
    name,
    autoComplete = "off",
    size = "sm",
    loading = false,
    dataFetch,
    key,
    onChange,
    ...props
  } = params;

  const defaultRightSection = () => (rightSection ? rightSection : undefined);

  const field = fields?.[name];

  const initialValue: string[] | undefined =
    typeof field?.initialValue === "string"
      ? [field.initialValue]
      : Array.isArray(field?.initialValue)
        ? field.initialValue
        : undefined;

  const fieldControl = useInputControl<string[]>({
    ...field,
    formId: field.formId,
    initialValue,
  });

  const [defaultKey] = useState(
    !key || ["number", "bigint"].includes(typeof key)
      ? cuid2.createId()
      : key.toString(),
  );
  const {
    data: fetcherData,
    load: fetcherFunc,
    state: fetcherState,
  } = useFetcher<TLoader>({ key: defaultKey });

  const { showDialog } = useDialog();

  const [options, setOptions] = useState<ComboboxItem[]>([]);

  const [totalPages, setTotalPages] = useState(1);
  const [queryParams, setQueryParams] = useState<QueryParamType & TParams>({
    search: "",
    limit: 50,
    page: 1,
  } as QueryParamType & TParams);

  useEffect(() => {
    if (dataFetch?.urlPath) {
      const params = new URLSearchParams(
        Object.fromEntries(
          Object.entries(queryParams).map(([key, value]) => [
            key,
            String(value),
          ]),
        ),
      );

      const url = new URL(dataFetch.urlPath, window.location.origin);
      fetcherFunc(`${url.pathname}?${params.toString()}`);
    }
  }, [queryParams.page, queryParams.limit, queryParams.search]);

  const previousParams = useRef(dataFetch?.params);

  useDidUpdate(() => {
    setOptions([]);
    setQueryParams((e) => ({
      ...e,
      ...(dataFetch?.params as Partial<QueryParamType & TParams>),
      page: 1,
    }));
    previousParams.current = dataFetch?.params;
  }, [dataFetch?.params]);

  useEffect(() => {
    if (dataFetch) {
      if (
        fetcherData &&
        typeof fetcherData === "object" &&
        "error" in fetcherData
      ) {
        showDialog({
          title: "Fetching Error",
          description: (fetcherData as { error?: string }).error || "",
          type: "error",
        });
      }

      if (!dataFetch.dataKeys) {
        setOptions([]);
        return;
      }
      const keys = dataFetch.dataKeys.split(".");
      let extractedData: unknown = fetcherData;
      for (const key of keys) {
        if (extractedData && typeof extractedData === "object") {
          extractedData = (extractedData as Record<string, unknown>)[key];
        } else {
          extractedData = undefined;
          break;
        }
      }

      const optionKeys = dataFetch.keys;
      let mergeOptions: ComboboxItem[] = [];
      if (Array.isArray(extractedData) && !!extractedData.length) {
        mergeOptions = mergeArrays(
          options,
          extractedData.map((e) => {
            let label = "";
            if (Array.isArray(optionKeys.label)) {
              label = optionKeys.label
                .map((label) => e[label!].toString())
                .join(" - ");
            } else {
              label = e[optionKeys.label];
            }

            let value = "";
            if (typeof e[optionKeys.value] == "number") {
              value = e[optionKeys.value].toString();
            } else {
              value = e[optionKeys.value];
            }

            return {
              value,
              label,
            };
          }),
          "value",
        );
      }

      setOptions(mergeOptions);
      const pagination = (
        fetcherData as { pagination?: { totalPages?: number } }
      )?.pagination;
      setTotalPages(pagination?.totalPages ?? 1);
    }
  }, [JSON.stringify(fetcherData)]);

  const scrollRef = useRef(null);
  const handleScroll = (e: React.RefObject<HTMLDivElement>) => {
    if (!e.current) {
      return;
    }

    const scrollPos = e.current.scrollTop + e.current.clientHeight;

    if (
      Math.ceil(scrollPos) >= e.current?.scrollHeight &&
      queryParams.page < totalPages
    ) {
      setQueryParams((e) => ({ ...e, page: e.page + 1 }));
    }
  };

  return (
    <MultiSelect
      size={size}
      styles={{ label: { fontWeight: 600 } }}
      label={label}
      autoComplete={autoComplete}
      data={options}
      onChange={(selectedValue) => {
        fieldControl.change(selectedValue ?? []);

        if (typeof onChange === "function") {
          onChange(selectedValue);
        }
      }}
      rightSection={
        loading || fetcherState === "loading" ? (
          <Loader size="xs" color="dark" />
        ) : (
          defaultRightSection()
        )
      }
      aria-label={
        typeof label === "string" && !params["aria-label"]
          ? label
          : params["aria-label"]
      }
      {...props}
      {...getInputProps(field, { type: "text" })}
      value={fieldControl.value as string[]}
      defaultValue={field.initialValue as string[]}
      // TODO: Enabled search item
      searchable={true}
      error={field?.errors?.[0] || ""}
      scrollAreaProps={{
        viewportRef: scrollRef,
        onScrollPositionChange: () => handleScroll(scrollRef),
      }}
    />
  );
}

export default InputMultiSelect;
