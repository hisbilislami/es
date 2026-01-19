import { ColumnDef } from "@tanstack/react-table";

export interface Timezone {
  id: number;
  code: string;
  name: string;
  offset_sdt: string;
  offset_dst: string;
  abbrevation_sdt: string;
  abbrevation_dst: string;
  active: boolean;
}

export const columns: ColumnDef<Timezone>[] = [
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
    header: "Koreksi SDT",
    accessorKey: "offset_sdt",
    size: 30,
  },
  {
    header: "Koreksi DST",
    accessorKey: "offset_dst",
    size: 30,
  },
  {
    header: "Singkatan SDT",
    accessorKey: "abbrevation_sdt",
    size: 30,
  },
  {
    header: "Singkatan DST",
    accessorKey: "abbrevation_dst",
    size: 30,
  },
];
