import { ColumnDef } from "@tanstack/react-table";

export interface District {
  id: number;
  code: string;
  name: string;
  city: string;
  province: string;
  country: string;
  active: boolean;
}

export const columns: ColumnDef<District>[] = [
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
    header: "Kota",
    accessorKey: "city",
    size: 30,
  },
  {
    header: "Provinsi",
    accessorKey: "province",
    size: 30,
  },
  {
    header: "Negara",
    accessorKey: "country",
    size: 30,
  },
];
