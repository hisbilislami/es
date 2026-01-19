import { ColumnDef } from "@tanstack/react-table";

export interface Identity {
  id: number;
  code: string;
  name: string;
  min_length: string;
  max_length: string;
  active: boolean;
}

export const columns: ColumnDef<Identity>[] = [
  {
    header: "Kode",
    accessorKey: "code",
    size: 30,
  },
  {
    header: "Nama",
    accessorKey: "name",
    size: 30,
  },
  {
    header: "Panjang Minimal",
    accessorKey: "min_length",
    size: 30,
  },
  {
    header: "Panjang Maksimal",
    accessorKey: "max_length",
    size: 30,
  },
  {
    header: "Status",
    accessorKey: "active",
    cell: ({ row }) => {
      const { active } = row.original;
      const status = active === true ? "Aktif" : "Tidak Aktif";
      return <span>{status}</span>;
    },
    size: 30,
  },
];
