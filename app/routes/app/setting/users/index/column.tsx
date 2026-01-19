import { ColumnDef } from "@tanstack/react-table";

export interface User {
  id: number;
  role_id: number;
  username: string;
  name: string;
  email: string;
  phone_number: string;
  role_name: string;
  status: string;
}

export const columns: ColumnDef<User>[] = [
  {
    header: "Username",
    accessorKey: "username",
    size: 30,
  },
  {
    header: "Nama",
    accessorKey: "name",
    size: 30,
    cell: ({ row }) => {
      const { name } = row.original;

      return <span className="whitespace-nowrap">{name}</span>;
    },
  },
  {
    header: "Email",
    accessorKey: "email",
    size: 30,
  },
  {
    header: "Mobile Phone",
    accessorKey: "phone_number",
    size: 30,
  },
  {
    header: "Role",
    accessorKey: "role_name",
    size: 30,
  },
  {
    header: "Status",
    accessorKey: "status",
    size: 20,
    cell: ({ row }) => {
      const { status } = row.original;

      return <span className="capitalize">{status}</span>;
    },
  },
];
