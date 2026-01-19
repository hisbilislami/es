import { ColumnDef } from "@tanstack/react-table";

export interface Company {
  id: number;
  code: string;
  name: string;
  display_name: string;
  registered_date: string;
  registered_number: string;
  email: string;
  phone: string;
  remaks: string;
  active: boolean;
}

export const columns: ColumnDef<Company>[] = [
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
    header: "Ditampilkan",
    accessorKey: "display_name",
    size: 30,
  },
  {
    header: "Email",
    accessorKey: "email",
    size: 30,
  },
  {
    header: "Tgl Register",
    accessorKey: "registered_date",
    size: 30,
  },
  {
    header: "Nomor Register",
    accessorKey: "registered_number",
    size: 30,
  },
];
