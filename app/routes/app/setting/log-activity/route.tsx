import { LoaderFunctionArgs } from "@remix-run/node";
import {
  ClientLoaderFunctionArgs,
  useFetcher,
  useLocation,
  useNavigate,
  useNavigation,
  useSearchParams,
} from "@remix-run/react";
import { useMemo, useState } from "react";
import { cacheClientLoader, useCachedLoaderData } from "remix-client-cache";

import AppCardForm from "~/components/card/app-card-form";
import {
  DataTable,
  DataTablePagination,
  useDataTable,
} from "~/components/table";

import { columns } from "./column";
import { loaderHandler } from "./loader";

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

const LogActivityPage = () => {
  const { result } = useCachedLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const { state } = useNavigation();
  const navigate = useNavigate();
  const page = useMemo(() => searchParams.get("page") || 0, [searchParams]);
  const size = useMemo(() => searchParams.get("size") || 10, [searchParams]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [ignoreLoading, setIgnoreLoading] = useState<boolean>(false);

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

  const fetcher = useFetcher<typeof action>();

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

    fetcher.load(`${location.pathname}?${params.toString()}`);
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  };

  return (
    <AppCardForm title="Log Aktifitas" isForm={false} actionButtons={false}>
      <DataTable
        withSearchField={true}
        onSearch={onSearch}
        onRefresh={onRefresh}
        table={table}
        columns={columns}
      />
      <DataTablePagination table={table} />
    </AppCardForm>
  );
};

export default LogActivityPage;
