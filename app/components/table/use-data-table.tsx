import { Skeleton } from "@mantine/core";
import {
  ColumnDef,
  PaginationState,
  RowSelectionState,
  SortingState,
  Updater,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";

interface UseDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  count: number;
  isLoading?: boolean;
  paginationState?: PaginationState;
  onClickPreviousPage?: () => void;
  onClickNextPage?: () => void;
  columnPinning?: Record<"left" | "right", string[]>;
  onRowSelectionChange?: (updater: Updater<RowSelectionState>) => void;
}

function useDataTable<TData, TValue>({
  columns,
  data,
  count,
  isLoading,
  paginationState = {
    pageIndex: 0,
    pageSize: 10,
  },
  columnPinning = {
    left: [],
    right: [],
  },
  onClickPreviousPage = () => {},
  onClickNextPage = () => {},
  onRowSelectionChange,
}: UseDataTableProps<TData, TValue>) {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: paginationState?.pageIndex,
    pageSize: paginationState?.pageSize,
  });
  const pageCount = useMemo(
    () => Math.ceil(count / pagination.pageSize),
    [count, pagination.pageSize],
  );

  const [sorting, setSorting] = useState<SortingState>([]);

  const tableData = useMemo(
    () =>
      isLoading
        ? Array(Number(pagination.pageSize)).fill({
            name: "",
            url: "",
          })
        : data,
    [isLoading, pagination.pageSize, data],
  );

  const tableColumns = useMemo(
    () =>
      isLoading
        ? columns.map((column) => ({
            ...column,
            cell: () => <Skeleton height={18} radius="xl" />,
          }))
        : columns,
    [isLoading, columns],
  );

  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable<TData>({
    data: tableData,
    columns: tableColumns,
    state: {
      pagination,
      sorting,
      rowSelection,
      columnPinning,
    },
    rowCount: count,
    pageCount: pageCount,
    manualPagination: true,
    columnResizeMode: "onChange",
    manualSorting: true,
    // @ts-expect-error row of type any
    getRowId: (row) => row.id,
    enableRowSelection: true,
    enableMultiRowSelection: true,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    // debugTable: true,
  });

  function onChangeToPreviousPage() {
    onClickPreviousPage();
    table.previousPage();
  }

  function onChangeToNextPage() {
    onClickNextPage();
    table.nextPage();
  }

  useEffect(() => {
    if (onRowSelectionChange) {
      onRowSelectionChange(table.getState().rowSelection);
    }
  }, [table.getState().rowSelection]);

  return {
    table,
    pagination,
    sorting,
    rowSelection,
    onChangeToPreviousPage,
    onChangeToNextPage,
    columns: tableColumns,
  };
}

export { useDataTable };
