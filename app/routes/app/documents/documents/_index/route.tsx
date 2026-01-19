import AppCardForm from "~/components/card/app-card-form";
import {
  DataTable,
  DataTablePagination,
  useDataTable,
} from "~/components/table";
import { columns, ListDocuments } from "./columns";
import { useMemo, useState } from "react";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { loaderHandler } from "./loader";
import { cacheClientLoader, useCachedLoaderData } from "remix-client-cache";
import {
  ClientLoaderFunctionArgs,
  useFetcher,
  useLocation,
  useNavigate,
  useNavigation,
  useSearchParams,
} from "@remix-run/react";
import { useDialog } from "~/context/DialogContext";
import { Select } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import dayjs from "dayjs";

type FilterProps = {
  status: string | null;
  date: Date | null;
  onChange: (filters: { status: string | null; date: Date | null }) => void;
};

const Filter = ({ status, date, onChange }: FilterProps) => {
  return (
    <>
      <Select
        label="Status"
        placeholder="status"
        name="status"
        value={status}
        onChange={(value) => onChange({ status: value, date })}
        data={[
          { value: "pending", label: "Ditunda" },
          { value: "done", label: "Selesai" },
          { value: "reject", label: "Ditolak" },
          { value: "expired", label: "Kedaluwarsa" },
        ]}
        clearable
      />
      <DateInput
        valueFormat="DD/MM/YYYY"
        label="Tanggal"
        placeholder="DD/MM/YYYY"
        value={date}
        onChange={(value) => onChange({ status, date: value })}
      />
    </>
  );
};

export const action = () => {
  return null;
};

export const loader = ({ request }: LoaderFunctionArgs) => {
  return loaderHandler(request);
};

export const ErrorBoundary = () => {};

export const clientLoader = (args: ClientLoaderFunctionArgs) =>
  cacheClientLoader(args);

clientLoader.hydrate = true;

const ListDocument = () => {
  const { result } = useCachedLoaderData<typeof loader>();
  const { state } = useNavigation();
  const [ignoreLoading, setIgnoreLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const page = useMemo(() => searchParams.get("page") || 0, [searchParams]);
  const size = useMemo(() => searchParams.get("size") || 10, [searchParams]);

  const [filterStatus, setFilterStatus] = useState<string | null>(
    searchParams.get("status"),
  );
  const [filterDate, setFilterDate] = useState<Date | null>(
    searchParams.get("date") ? new Date(searchParams.get("date")!) : null,
  );

  const fetcher = useFetcher<typeof action>();

  const { table } = useDataTable({
    columns: columns,
    data: result?.data || [],
    count: result?.totalCount || 0,
    isLoading: state !== "idle" && ignoreLoading === false,
    paginationState: {
      pageIndex: Number(page),
      pageSize: Number(size),
    },
  });

  const handleFilterChange = (filters: {
    status: string | null;
    date: Date | null;
  }) => {
    setFilterStatus(filters.status);
    setFilterDate(filters.date);
  };

  const handleFilter = () => {
    const params = new URLSearchParams(searchParams);

    if (filterStatus !== null) {
      params.set("status", filterStatus);
    } else {
      params.delete("status");
    }

    if (filterDate !== null) {
      params.set("date", dayjs(filterDate).format("YYYY-MM-DD"));
    } else {
      params.delete("date");
    }

    navigate(`?${params.toString()}`);

    setFilterStatus(null);
    setFilterDate(null);
  };

  const onSearch = (query: string) => {
    const params = new URLSearchParams(searchParams);

    if (query) {
      params.set("q", query);
    } else {
      params.delete("q");
    }

    navigate(`?${params.toString()}`, { replace: true });
  };

  const location = useLocation();

  const onRefresh = () => {
    const params = new URLSearchParams(location.search);
    params.delete("q");
    params.delete("status");
    params.delete("date");

    fetcher.load(`${location.pathname}?${params.toString()}`);
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  };

  return (
    <>
      <AppCardForm title="Berkas" isForm={false}>
        <DataTable
          columns={columns}
          table={table}
          withAction={false}
          onSearch={onSearch}
          textName="Berkas"
          withSearchField={true}
          onRefresh={onRefresh}
          withFilter={true}
          onFilter={() => handleFilter()}
          onFilterReset={() => {
            setFilterStatus(null);
            setFilterDate(null);
          }}
          FilterComponent={() => (
            <Filter
              status={filterStatus}
              date={filterDate}
              onChange={handleFilterChange}
            />
          )}
        />
        <DataTablePagination table={table} />
      </AppCardForm>
    </>
  );
};

export default ListDocument;
