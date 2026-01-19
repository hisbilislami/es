import { ColumnDef } from "@tanstack/react-table";

export interface Salutation {
  id: number;
  code: string;
  name: string;
  description: string;
  active: boolean;
}

export const columns: ColumnDef<Salutation>[] = [
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
    header: "Deskripsi",
    accessorKey: "description",
    size: 30,
  },
];
