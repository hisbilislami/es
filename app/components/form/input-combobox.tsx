import { getInputProps, useInputControl } from "@conform-to/react";
import { ComboboxItem, Loader, Select } from "@mantine/core";
import { useDebouncedState, useDidUpdate } from "@mantine/hooks";
import cuid2 from "@paralleldrive/cuid2";
import { useFetcher } from "@remix-run/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { mergeArrays } from "~/utils/array-helper";

import type { InputComboBoxProps } from "./types";

export type QueryParamType = {
  search?: string;
  page: number;
  limit: number;
};

export function InputComboBox<TLoader, TParams = Record<string, unknown>>(
  params: InputComboBoxProps<TParams>,
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

  const field = fields?.[name];
  const fieldControl = useInputControl(
    field as { initialValue?: string; name: string; formId: string },
  );

  const lastUrl = useRef<string | null>(null);

  // 🔹 Use stable key and fetcher
  const fetchKey = useMemo(
    () =>
      !key || ["number", "bigint"].includes(typeof key)
        ? cuid2.createId()
        : key.toString(),
    [key],
  );
  const fetcher = useFetcher<TLoader>({ key: fetchKey });

  // 🔹 Debounced search
  const [search, setSearch] = useDebouncedState("", 200);
  const [options, setOptions] = useState<
    (ComboboxItem & { originalData?: unknown })[]
  >([]);
  const [totalPages, setTotalPages] = useState(1);

  // 🔹 Keep query params stable
  const [queryParams, setQueryParams] = useState<QueryParamType & TParams>({
    search: "",
    limit: skipLimit ? -1 : 50,
    page: 1,
  } as QueryParamType & TParams);

  const stableParams = useMemo(
    () => dataFetch?.params ?? {},
    [dataFetch?.params],
  );

  // --- Data fetching
  const buildUrl = useCallback(() => {
    if (!dataFetch?.urlPath) return null;

    const hasValidParams =
      !stableParams ||
      Object.values(stableParams).every((val) => val != null && val !== "");

    if (!hasValidParams) return null;

    const searchParams = new URLSearchParams();
    for (const [k, v] of Object.entries({
      ...queryParams,
      ...stableParams,
    })) {
      searchParams.append(k, String(v));
    }

    const url = new URL(dataFetch.urlPath, window.location.origin);
    url.search = searchParams.toString();
    return `${url.pathname}${url.search}`;
  }, [dataFetch?.urlPath, stableParams, queryParams]);

  useDidUpdate(() => {
    const url = buildUrl();
    if (url && url !== lastUrl.current && fetcher.state === "idle") {
      lastUrl.current = url;
      fetcher.load(url);
    }
  }, [buildUrl]);

  // --- Reset when dataFetch.params changes
  useDidUpdate(() => {
    setOptions([]);
    setQueryParams((prev) => ({
      ...prev,
      ...stableParams,
      page: 1,
    }));
  }, [stableParams]);

  // --- Update query when search changes
  useEffect(() => {
    setQueryParams((prev) => ({ ...prev, search }));
  }, [search]);

  // --- Extract and merge fetched data
  useEffect(() => {
    if (!dataFetch?.dataKeys || !fetcher.data) {
      setOptions([]);
      return;
    }

    const dataKeys = dataFetch.dataKeys.split(".");
    let extracted: unknown = fetcher.data;
    for (const k of dataKeys) {
      if (
        typeof extracted === "object" &&
        extracted !== null &&
        k in extracted
      ) {
        extracted = (extracted as Record<string, unknown>)[k];
      } else {
        extracted = undefined;
        break;
      }
    }

    if (!Array.isArray(extracted)) {
      setOptions([]);
      return;
    }

    const { label: labelKey, value: valueKey } = dataFetch.keys;
    const newOptions = extracted.map((item) => ({
      value: String(item[valueKey]),
      label: Array.isArray(labelKey)
        ? labelKey.map((k) => item[k]).join(" - ")
        : item[labelKey],
      originalData: item,
    }));

    setOptions((prev) => mergeArrays(prev, newOptions, "value"));

    const pagination = (
      fetcher.data as Partial<{ pagination?: { totalPages?: number } }>
    ).pagination;
    setTotalPages(pagination?.totalPages ?? 1);
  }, [fetcher.data, dataFetch]);

  // --- Infinite scroll
  const scrollRef = useRef<HTMLDivElement>(null);
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const isBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 2;
    if (isBottom && queryParams.page < totalPages) {
      setQueryParams((prev) => ({ ...prev, page: prev.page + 1 }));
    }
  }, [queryParams.page, totalPages]);

  // --- Input props
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { key: _k, ...inputProps } = getInputProps(field, { type: "text" });

  return (
    <Select
      key={remountKey ?? field.key}
      size={size}
      label={label}
      styles={{ label: { fontWeight: 600 } }}
      autoComplete={autoComplete}
      data={options}
      searchable={searchable}
      onSearchChange={searchable ? setSearch : undefined}
      onChange={(value, option: ComboboxItem & { originalData?: unknown }) => {
        fieldControl.change(value ?? "");
        onChange?.(value, option);
      }}
      value={fieldControl.value}
      error={field?.errors?.[0] || ""}
      rightSection={
        loading || fetcher.state === "loading" ? (
          <Loader size="xs" color="dark" />
        ) : (
          rightSection
        )
      }
      onDropdownOpen={() => {
        const url = buildUrl();
        if (url) {
          fetcher.load(url);
        }
      }}
      aria-label={
        typeof label === "string" && !params["aria-label"]
          ? label
          : params["aria-label"]
      }
      {...inputProps}
      {...props}
      scrollAreaProps={{
        viewportRef: scrollRef,
        onScrollPositionChange: handleScroll,
      }}
    />
  );
}

export default InputComboBox;
