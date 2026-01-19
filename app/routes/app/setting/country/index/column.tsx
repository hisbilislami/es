import { ColumnDef } from "@tanstack/react-table";

export interface Country {
  id: number;
  code: string;
  name: string;
  sni_code: string;
  sni_name: string;
  phone_code: string;
  active: boolean;
  status: "Aktif" | "Non-Aktif";
}

export const columns: ColumnDef<Country>[] = [
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
    header: "Kode ISO",
    accessorKey: "iso_code",
    size: 30,
  },
  {
    header: "Nama ISO",
    accessorKey: "iso_name",
    size: 30,
  },
  {
    header: "Kode Area",
    accessorKey: "phone_code",
    size: 30,
  },
];
