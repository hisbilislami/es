import { ColumnDef } from "@tanstack/react-table";

export interface City {
  id: number;
  code: string;
  name: string;
  sni_name: string;
  province_name: string;
  province_id: number;
  country_name: string;
  country_id: number;
  timezone_name: string;
  active: boolean;
}

export const columns: ColumnDef<City>[] = [
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
    header: "Provinsi",
    accessorKey: "province_name",
    size: 30,
  },
  {
    header: "Negara",
    accessorKey: "country_name",
    size: 30,
  },
  {
    header: "Zona Waktu",
    accessorKey: "timezone_name",
    size: 30,
  },
];
