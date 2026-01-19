import { ColumnDef } from "@tanstack/react-table";

export interface Menus {
  id: number;
  code: string;
  title: string;
  module: string;
  status: "Aktif" | "Non-aktif";
}

export const columns: ColumnDef<Menus>[] = [
  {
    header: "Kode Menu",
    accessorKey: "code",
    size: 50,
  },
  {
    header: "Nama Menu",
    accessorKey: "title",
    size: 100,
  },
  {
    header: "Modul",
    accessorKey: "module",
    size: 100,
  },
];
