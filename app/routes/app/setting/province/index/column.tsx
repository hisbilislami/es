import { ColumnDef } from "@tanstack/react-table";

export interface Province {
  id: number;
  code: string;
  name: string;
  sni_name: string;
  country_name: string;
  country_id: number;
  active: boolean;
}

export const columns: ColumnDef<Province>[] = [
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
    header: "Nama SNI",
    accessorKey: "sni_name",
    size: 30,
  },
  {
    header: "Negara",
    accessorKey: "country_name",
    size: 30,
  },
];
