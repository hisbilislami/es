import { getInputProps, useInputControl } from "@conform-to/react";
import { ComboboxItem, Loader, Select } from "@mantine/core";
import { useDebouncedState, useDidUpdate } from "@mantine/hooks";
import cuid2 from "@paralleldrive/cuid2";
import { useFetcher } from "@remix-run/react";
import { useEffect, useState, useRef } from "react";

import { mergeArrays } from "~/utils/array-helper";

import { InputSelectProps } from "./types";

export type QueryParamType = {
  search?: string;
  page: number;
  limit: number;
};

function InputSelect<TLoader, TParams = Record<string, unknown>>(
  params: InputSelectProps<TParams>,
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
    searchable,
    key,
    remountKey,
    skipLimit,
    onChange,
    ...props
  } = params;

  const defaultRightSection = () => (rightSection ? rightSection : undefined);

  const field = fields?.[name];
  const fieldControl = useInputControl(
    field as { initialValue?: string; name: string; formId: string },
  );

  const [searchString, setSearchString] = useDebouncedState("", 200);

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

  const [options, setOptions] = useState<
    (ComboboxItem & { originalData?: unknown })[]
  >([]);

  // const [search, setSearch] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [queryParams, setQueryParams] = useState<QueryParamType & TParams>({
    search: "",
    limit: skipLimit ? -1 : 50,
    page: 1,
  } as QueryParamType & TParams);

  useEffect(() => {
    if (dataFetch?.urlPath) {
      const hasValidParams =
        !dataFetch.params ||
        Object.values(dataFetch.params).every((val) => !!val);
      if (!hasValidParams) return;

      const params = new URLSearchParams(
        Object.entries(queryParams).reduce(
          (acc, [key, value]) => {
            acc[key] = String(value);
            return acc;
          },
          {} as Record<string, string>,
        ),
      );
      const url = new URL(dataFetch.urlPath, window.location.origin);
      fetcherFunc(`${url.pathname}?${params}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(queryParams)]);

  useDidUpdate(() => {
    setOptions([]);
    setQueryParams((e) => ({ ...e, ...dataFetch?.params, page: 1 }));
  }, [JSON.stringify(dataFetch?.params)]);

  useEffect(() => {
    setQueryParams((e) => ({ ...e, search: searchString }));
  }, [searchString]);

  useEffect(() => {
    if (dataFetch) {
      if (!dataFetch.dataKeys) {
        setOptions([]);
        return;
      }
      const keys = dataFetch.dataKeys.split(".");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let extractedData: any = fetcherData;
      for (const key of keys) {
        if (extractedData && typeof extractedData === "object") {
          if (
            extractedData &&
            typeof extractedData === "object" &&
            key in extractedData
          ) {
            extractedData = extractedData[key];
          }
        } else {
          extractedData = undefined;
          break;
        }
      }

      const optionKeys = dataFetch.keys;
      let mergeOptions: (ComboboxItem & { originalData?: unknown })[] = [];
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

            const originalData = e;

            return {
              value,
              label,
              originalData: originalData,
            };
          }),
          "value",
        );
      }

      setOptions(mergeOptions);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setTotalPages((fetcherData as any)?.pagination?.totalPages || 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // eslint-disable-next-line react/prop-types, @typescript-eslint/no-unused-vars
  const { key: _key, ...restProps }: { [key: string]: unknown } = props;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { key: _k, ...inputProps } = getInputProps(field, { type: "text" });

  return (
    <Select
      key={remountKey ?? field.key}
      size={size}
      styles={{ label: { fontWeight: 600 } }}
      label={label}
      autoComplete={autoComplete}
      data={options}
      onSearchChange={(value: string) => {
        if (searchable) {
          setSearchString(value);
        }
      }}
      onChange={(
        selectedValue,
        opt: ComboboxItem & { originalData?: unknown },
      ) => {
        fieldControl.change(selectedValue ?? "");

        if (typeof onChange == "function") onChange(selectedValue, opt);
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
      {...restProps}
      {...inputProps}
      value={fieldControl.value}
      // TODO: Enabled search item
      searchable={searchable}
      error={field?.errors?.[0] || ""}
      scrollAreaProps={{
        viewportRef: scrollRef,
        onScrollPositionChange: () => handleScroll(scrollRef),
      }}
    />
  );
}

export default InputSelect;
