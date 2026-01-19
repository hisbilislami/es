import { ColumnDef } from "@tanstack/react-table";

import InputBooleanCheckbox from "~/components/form/input-boolean-checkbox";

import { OriginType } from "./constant";

export interface MenuItem {
  title: string;
  menu_id: number;
  parent_id: number | null;
  group: string | null;
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
}

export function getColumns(
  menuPermissions: MenuItem[],
  setMenuPermissions: React.Dispatch<React.SetStateAction<MenuItem[]>>,
  lastChangedBy: React.MutableRefObject<OriginType>,
): ColumnDef<MenuItem>[] {
  return [
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => {
        const { menu_id, title, group, parent_id } = row.original;
        const rowIndex = row.index;
        return (
          <>
            <input
              type="hidden"
              name={`permissions[${rowIndex}].menu_id`}
              value={menu_id ?? ""}
            />
            <input
              type="hidden"
              name={`permissions[${rowIndex}].parent_id`}
              value={parent_id ?? ""}
            />
            <input
              type="hidden"
              name={`permissions[${rowIndex}].group`}
              value={group ?? ""}
            />
            <input
              type="hidden"
              name={`permissions[${rowIndex}].title`}
              value={title}
            />
            <span className={parent_id ? "pl-4" : ""}>
              {parent_id ? (group ? `[${group}] ${title}` : title) : title}
            </span>
          </>
        );
      },
    },
    ...["create", "read", "update", "delete"].map((key) => ({
      accessorKey: key,
      header: key.charAt(0).toUpperCase() + key.slice(1),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cell: ({ row, column }: any) => {
        const rowIndex = row.index;
        const accessor = column.id as keyof MenuItem;
        const { parent_id } = row.original;
        const checked = Boolean(menuPermissions[rowIndex]?.[accessor] ?? false);

        return (
          parent_id && (
            <InputBooleanCheckbox
              name={`permissions[${rowIndex}].${accessor}`}
              checked={checked}
              onChange={(e) => {
                const updated = [...menuPermissions];
                updated[rowIndex] = {
                  ...updated[rowIndex],
                  [accessor]: e.currentTarget.checked,
                };
                lastChangedBy.current = "menuPermissions";
                setMenuPermissions(updated);
              }}
            />
          )
        );
      },
    })),
  ];
}
