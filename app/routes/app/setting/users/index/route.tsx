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
import InputSelect2 from "~/components/form/input-select2";
import {
  DataTable,
  DataTablePagination,
  useDataTable,
} from "~/components/table";
import { useDialog } from "~/context/DialogContext";

import { actionHandler } from "./action";
import { columns, User } from "./column";
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

type FilterProps = {
  role: string | null;
  onChange: (filters: { role: string | null }) => void;
};

const Filter = ({ role, onChange }: FilterProps) => {
  return (
    <>
      <InputSelect2
        name="role"
        displayField="name"
        label="Role"
        valueField="id"
        defaultValue={role}
        onChange={(value) => onChange({ role: value })}
        dataFetch={{
          urlPath: "api/roles",
          dataKeys: "data",
        }}
      />
    </>
  );
};

const UserPage = () => {
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

  const onEdit = (data: User) => {
    fetcher.submit(
      {
        id: data.id,
        action: "update",
      },
      { method: "POST", action: "/app/setting/users" },
    );
  };

  const onDelete = (data: User) => {
    showDialog({
      title: "Hapus",
      description: "Apakah anda yakin ingin menghapus data ini?",
      type: "confirmation",
      onConfirm: () => {
        fetcher.submit(
          { id: data.id, action: "delete" },
          { method: "POST", action: "/app/setting/users" },
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

  const [filterRole, setFilterRole] = useState<string | null>(
    searchParams.get("role"),
  );

  const handleFilter = () => {
    const params = new URLSearchParams(searchParams);

    if (filterRole !== null) {
      params.set("role", filterRole);
    } else {
      params.delete("role");
    }

    navigate(`?${params.toString()}`);

    setFilterRole(null);
  };

  const handleFilterChange = (filters: { role: string | null }) => {
    setFilterRole(filters.role);
  };

  return (
    <>
      <AppCardForm isForm={false} title="Master User">
        <DataTable
          table={table}
          columns={columns}
          textName="User"
          withAction={true}
          onSearch={onSearch}
          onEdit={onEdit}
          onDelete={onDelete}
          withFilter={true}
          onFilter={() => handleFilter()}
          onFilterReset={() => {
            setFilterRole(null);
          }}
          FilterComponent={() => {
            return <Filter role={filterRole} onChange={handleFilterChange} />;
          }}
          onAdd={() => {
            setIgnoreLoading(true);
            navigate("/app/setting/users/manage");
          }}
          withSearchField={true}
          onRefresh={onRefresh}
        />
        <DataTablePagination table={table} />
      </AppCardForm>
    </>
  );
};

export default UserPage;
