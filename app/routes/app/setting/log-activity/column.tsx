import { ColumnDef } from "@tanstack/react-table";

export interface LogActivities {
  id: number;
  tenant_id: string;
  user: string;
  category: string;
  ip_address: string;
  action: string;
  created_at: string;
}

export const columns: ColumnDef<LogActivities>[] = [
  {
    header: "User",
    accessorKey: "user",
    size: 80,
  },
  {
    header: "IP Address",
    accessorKey: "ip_address",
    size: 80,
  },
  {
    header: "Tenant",
    accessorKey: "tenant_id",
    size: 80,
  },
  {
    header: "Kategori",
    accessorKey: "category",
    size: 80,
  },
  {
    header: "Aksi",
    accessorKey: "action",
    size: 80,
  },
  {
    header: "Waktu",
    accessorKey: "created_at",
    size: 80,
  },
];
