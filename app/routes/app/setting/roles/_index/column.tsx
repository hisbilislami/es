import { Badge } from "@mantine/core";
import { ColumnDef } from "@tanstack/react-table";

export interface Roles {
  id: number;
  code: string;
  name: string;
  active: boolean;
}

export const columns: ColumnDef<Roles>[] = [
  {
    header: "Kode Role",
    accessorKey: "code",
  },
  {
    header: "Nama Role",
    accessorKey: "name",
  },
  {
    header: "Status",
    accessorKey: "status",
    cell(props) {
      const { active } = props.row.original;
      let color = "green";
      let textStatus = "Aktif";

      if (!active) {
        color = "red";
        textStatus = "Non-Aktif";
      }

      return (
        <div className="w-full inline-flex justify-center items-center">
          <Badge
            variant="light"
            className="font-normal"
            radius="sm"
            color={color}
          >
            {textStatus}
          </Badge>
        </div>
      );
    },
  },
];
