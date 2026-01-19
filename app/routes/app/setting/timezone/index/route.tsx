import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
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
import { useDialog } from "~/context/DialogContext";

import { actionHandler } from "./action";
import { columns, Timezone } from "./column";
import { loaderHandler } from "./loader";

export const action = ({ request }: ActionFunctionArgs) => {
  return actionHandler(request);
};

export const loader = ({ request }: LoaderFunctionArgs) => {
  return loaderHandler(request);
};

export const ErrorBoundary = () => {};

export const clientLoader = (args: ClientLoaderFunctionArgs) =>
  cacheClientLoader(args);

clientLoader.hydrate = true;

const TimezonePage = () => {
  const { result } = useCachedLoaderData<typeof loader>();
  const { state } = useNavigation();
  const [ignoreLoading, setIgnoreLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const page = useMemo(() => searchParams.get("page") || 0, [searchParams]);
  const size = useMemo(() => searchParams.get("size") || 10, [searchParams]);

  const fetcher = useFetcher<typeof action>();
  const { showDialog } = useDialog();

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

  const onSearch = (query: string) => {
    const params = new URLSearchParams(searchParams);

    if (query) {
      params.set("q", query);
    } else {
      params.delete("q");
    }

    navigate(`?${params.toString()}`, { replace: true });
  };

  const onEdit = (data: Timezone) => {
    fetcher.submit(
      {
        id: data.id,
        action: "update",
      },
      { method: "POST", action: "/app/setting/timezone" },
    );
  };

  const onDelete = (data: Timezone) => {
    showDialog({
      title: "Hapus",
      description: "Apakah anda yakin ingin menghapus data ini?",
      type: "confirmation",
      onConfirm: () => {
        fetcher.submit(
          { id: data.id, action: "delete" },
          { method: "POST", action: "/app/setting/timezone" },
        );
      },
      confirmText: "Ya",
    });
  };

  const location = useLocation();

  const onRefresh = () => {
    const params = new URLSearchParams(location.search);
    params.delete("q");

    fetcher.load(`${location.pathname}?${params.toString()}`);
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  };

  return (
    <>
      <AppCardForm isForm={false} title="Master Zona Waktu">
        <DataTable
          table={table}
          columns={columns}
          textName="Zona Waktu"
          withAction={true}
          onSearch={onSearch}
          onEdit={onEdit}
          onDelete={onDelete}
          onAdd={() => {
            setIgnoreLoading(true);
            navigate("/app/setting/timezone/manage");
          }}
          withSearchField={true}
          onRefresh={onRefresh}
        />
        <DataTablePagination table={table} />
      </AppCardForm>
    </>
  );
};

export default TimezonePage;
