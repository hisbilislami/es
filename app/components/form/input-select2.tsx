import {
  Combobox,
  Input,
  InputBase,
  Loader,
  ScrollArea,
  useCombobox,
} from "@mantine/core";
import { useDebouncedValue, useDidUpdate } from "@mantine/hooks";
import { useRef, useState } from "react";

import { InputSelect2Props } from "./types";

type ApiResponse<T> = {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

type QueryParamType = {
  search?: string;
  page: number;
  limit: number;
};

const asyncDataCache = new Map<string, unknown>();

function clearAsyncCache(url?: string) {
  if (url) {
    asyncDataCache.delete(url);
  } else {
    asyncDataCache.clear();
  }
}

async function getAsyncData<T>(url: string): Promise<T> {
  if (asyncDataCache.has(url)) {
    console.log("💾 Returning cached data for", url);
    return asyncDataCache.get(url) as T;
  }

  const res = await fetch(url);
  if (!res.ok) throw new Error("Network error");

  const json = await res.json();
  asyncDataCache.set(url, json);
  return json;
}

export default function InputSelect2<
  TItem extends Record<string, unknown>,
  TParams = Record<string, unknown>,
>(
  props: InputSelect2Props<TParams> & {
    displayField: keyof TItem;
    valueField: keyof TItem;
  },
) {
  const {
    dataFetch,
    skipLimit,
    valueField,
    displayField,
    name,
    label,
    onChange,
    ...rest
  } = props;

  const [value, setValue] = useState<string | null>(null);
  const [display, setDisplay] = useState<string | null>(null);
  const [localSearch, setLocalSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(localSearch, 200);

  const [data, setData] = useState<TItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const [queryParams, setQueryParams] = useState<QueryParamType & TParams>({
    search: "",
    limit: skipLimit ? -1 : 50,
    page: 1,
  } as QueryParamType & TParams);

  const scrollRef = useRef(null);

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
    onDropdownOpen: () => {
      if (data.length === 0 && !loading) {
        fetchOptions(true);
      }
      combobox.focusSearchInput();
    },
  });

  const buildFetchUrl = (): string | null => {
    if (!dataFetch?.urlPath) return null;

    const hasValidParams =
      !dataFetch.params ||
      Object.values(dataFetch.params).every(
        (val) => val !== null && val !== undefined && val !== "",
      );
    if (!hasValidParams) return null;

    const baseUrl = new URL(dataFetch.urlPath, window.location.origin);
    const query = new URLSearchParams({
      limit: String(queryParams.limit),
      page: String(queryParams.page),
      search: debouncedSearch || "",
    });

    return `${baseUrl}?${query.toString()}`;
  };

  const fetchOptions = async (clearCache = false) => {
    const url = buildFetchUrl();
    if (!url) return;

    if (clearCache) clearAsyncCache(url);

    setLoading(true);
    try {
      const res = await getAsyncData<ApiResponse<TItem>>(url);
      setData((prev) =>
        queryParams.page > 1 ? [...prev, ...res.data] : res.data,
      );
      setTotalPages(res.pagination?.totalPages ?? 1);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
      combobox.resetSelectedOption();
    }
  };

  useDidUpdate(() => {
    fetchOptions(true);
  }, [debouncedSearch, queryParams.page, queryParams.limit]);

  const handleScroll = (el: React.RefObject<HTMLDivElement>) => {
    if (!el.current) return;

    const reachedBottom =
      Math.ceil(el.current.scrollTop + el.current.clientHeight) >=
      el.current.scrollHeight;

    if (reachedBottom && queryParams.page < totalPages) {
      setQueryParams((prev) => ({ ...prev, page: prev.page + 1 }));
    }
  };

  const options = data.map((item) => {
    const key = item[valueField] as string | number;
    const label = item[displayField] as string;
    return (
      <Combobox.Option value={String(key)} key={String(key)}>
        {label}
      </Combobox.Option>
    );
  });

  return (
    <Combobox
      size="sm"
      store={combobox}
      withinPortal={false}
      onOptionSubmit={(val, option) => {
        setValue(val);
        setDisplay(option.children as string);
        combobox.closeDropdown();

        const selectedItem = data.find(
          (item) => String(item[valueField]) === val,
        );

        if (selectedItem && onChange) {
          onChange(val, {
            value: val,
            label: String(selectedItem[displayField]),
            record: selectedItem,
          });
        }
      }}
      {...rest}
    >
      <Combobox.Target>
        <InputBase
          component="button"
          type="button"
          pointer
          name={name}
          value={value ?? ""}
          label={label}
          styles={{ label: { fontWeight: 600 } }}
          rightSection={loading ? <Loader size={18} /> : <Combobox.Chevron />}
          onClick={() => combobox.toggleDropdown()}
          rightSectionPointerEvents="none"
        >
          {display || (
            <Input.Placeholder>Pilih {label ?? "opsi"}</Input.Placeholder>
          )}
        </InputBase>
      </Combobox.Target>

      <Combobox.Dropdown>
        <Combobox.Search
          value={localSearch}
          onChange={(e) => {
            const val = e.currentTarget.value;
            setLocalSearch(val);
            setQueryParams((prev) => ({ ...prev, search: val, page: 1 }));
          }}
        />

        <Combobox.Options>
          <ScrollArea.Autosize
            viewportRef={scrollRef}
            onScrollPositionChange={() => handleScroll(scrollRef)}
          >
            {loading && data.length === 0 ? (
              <Combobox.Empty>Loading...</Combobox.Empty>
            ) : (
              options
            )}
          </ScrollArea.Autosize>
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}
