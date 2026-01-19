import { Button, Menu } from "@mantine/core";
import { useSearchParams } from "@remix-run/react";
import { Icon } from "@iconify/react";
import { Column } from "@tanstack/react-table";

import { cn } from "~/utils/tw";

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
}

function generateSortParams<TData, TValue>(
  searchParams: URLSearchParams,
  column: Column<TData, TValue>,
  isAsc: boolean,
) {
  const sort = searchParams.get("sort");
  const key = column.id;
  const direction = isAsc ? "asc" : "desc";
  let newSort = "";
  if (sort) {
    const sortArr = sort.split(",");
    const keyIndex = sortArr.findIndex((item) => item.includes(key));
    if (keyIndex !== -1) {
      sortArr.splice(keyIndex, 1);
    }
    sortArr.push(`${key}.${direction}`);
    newSort = sortArr.join(",");
  } else {
    newSort = `${key}.${direction}`;
  }

  return newSort;
}

export function DataTableHeaderSort<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  const [searchParams, setSearchParams] = useSearchParams();

  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>;
  }

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <Menu>
        <Menu.Target>
          <Button variant="transparent" color="gray" size="sm">
            <span className="text-sm font-normal text-gray-500">{title}</span>
            {column.getIsSorted() === "desc" ? (
              <Icon icon="tabler:arrow-down" className="ml-2 h-3.5 w-3.5" />
            ) : column.getIsSorted() === "asc" ? (
              <Icon icon="tabler:arrow-up" className="ml-2 h-3.5 w-3.5" />
            ) : (
              <Icon icon="tabler:selector" className="ml-2 h-3.5 w-3.5" />
            )}
          </Button>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item
            onClick={() => {
              column.toggleSorting(false);
              const sort = generateSortParams(searchParams, column, true);
              searchParams.set("sort", sort);
              setSearchParams(searchParams);
            }}
            leftSection={
              <Icon
                icon="tabler:arrow-up"
                className="mr-2 h-3.5 w-3.5 text-muted-foreground/70"
              />
            }
          >
            Asc
          </Menu.Item>
          <Menu.Item
            onClick={() => {
              column.toggleSorting(true);
              const sort = generateSortParams(searchParams, column, false);
              searchParams.set("sort", sort);
              setSearchParams(searchParams);
            }}
            leftSection={
              <Icon
                icon="tabler:arrow-down"
                className="mr-2 h-3.5 w-3.5 text-muted-foreground/70"
              />
            }
          >
            Desc
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </div>
  );
}
