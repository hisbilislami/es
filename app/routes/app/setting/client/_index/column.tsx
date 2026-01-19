import { ColumnDef } from "@tanstack/react-table";

export interface Clients {
  id: number;
  client_id: string;
  api_key: string;
  api_url?: string;
  active: boolean;
  status: "Aktif" | "Non-aktif";
}

export const columns: ColumnDef<Clients>[] = [
  {
    header: "Client ID",
    accessorKey: "client_id",
    size: 30,
  },
  {
    header: "API key",
    accessorKey: "api_key",
    size: 30,
    cell: ({ row }) => {
      const { api_key } = row.original;
      return (
        <div className="overflow-hidden w-32">
          <p className="overflow-hidden text-ellipsis whitespace-normal [-webkit-line-clamp:3] [-webkit-box-orient:vertical] display[-webkit-box]">
            {api_key}
          </p>
        </div>
      );
    },
  },
  {
    header: "API URL",
    accessorKey: "api_url",
    size: 30,
  },
  {
    header: "Status",
    accessorKey: "active",
    cell: ({ row }) => {
      const { active } = row.original;
      return active ? "Aktif" : "Non-aktif";
    },
    size: 10,
  },
];
