import { NativeSelect, Pagination } from "@mantine/core";
import { useSearchParams } from "@remix-run/react";
import { Table } from "@tanstack/react-table";

import { cn } from "~/utils/tw";

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  sizeOptions?: number[];
  showSelection?: boolean;
  onClickNextPage?: (curIdx: number) => void;
  onClickPreviousPage?: (curIdx: number) => void;
  onChangePageSize?: (pageSize: number) => void;
}

export function DataTablePagination<TData>({
  table,
  showSelection = false,
  sizeOptions = [10, 20, 30, 40, 50],
  onClickNextPage = () => {},
  onClickPreviousPage = () => {},
  onChangePageSize,
}: DataTablePaginationProps<TData>) {
  const [searchParams, setSearchParams] = useSearchParams();

  function onTablePageChange(pageIndex: number) {
    // this -1 needed to sync the page index of react-table and mantine pagination
    // since mantine in 1-indexed and react-table is 0-indexed
    table.setPageIndex(pageIndex - 1);
    searchParams.set("page", (pageIndex - 1).toString());
    searchParams.set("size", table.getState().pagination.pageSize.toString());
    setSearchParams(searchParams);
  }

  return (
    <div
      className={cn(
        "flex items-center",
        showSelection ? "justify-between" : "justify-end",
      )}
    >
      {showSelection ? (
        <div className="flex-1 text-sm text-muted-foreground">
          {Object.keys(table.getState().rowSelection).length} of{" "}
          {table.getRowCount()} rows selected
        </div>
      ) : null}
      <div className="flex items-center space-x-6 lg:space-x-8">
        {onChangePageSize ? (
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Rows per page</p>
            <NativeSelect
              data={sizeOptions.map((opt) => String(opt))}
              value={table.getState().pagination.pageSize}
              onChange={(value) => {
                table.setPageSize(Number(value.target.value));
                onChangePageSize?.(Number(value.target.value));
              }}
            />
          </div>
        ) : null}

        <div className="flex items-center space-x-2">
          <Pagination
            size="sm"
            withEdges
            total={table.getPageCount()}
            value={table.getState().pagination.pageIndex + 1}
            onChange={(value) => onTablePageChange(value)}
            onNextPage={() => {
              onClickNextPage(table.getState().pagination.pageIndex);
            }}
            onPreviousPage={() => {
              onClickPreviousPage(table.getState().pagination.pageIndex);
            }}
            onFirstPage={() => onTablePageChange(0)}
            onLastPage={() => onTablePageChange(table.getPageCount())}
            gap="xxs"
          />
        </div>
      </div>
    </div>
  );
}
