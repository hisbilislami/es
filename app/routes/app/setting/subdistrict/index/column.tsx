import { ColumnDef } from "@tanstack/react-table";

export interface Subdistrict {
  id: number;
  code: string;
  name: string;
  district: string;
  city: string;
  province: string;
  country: string;
  postal_code: string;
  active: boolean;
}

export const columns: ColumnDef<Subdistrict>[] = [
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
    header: "District/Kecamatan",
    accessorKey: "district",
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
  {
    header: "Kode Pos",
    accessorKey: "postal_code",
    size: 30,
  },
];
