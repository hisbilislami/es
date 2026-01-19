import { ColumnDef } from "@tanstack/react-table";

export interface JobPosition {
  id: number;
  code: string;
  name: string;
  description: string;
  active: boolean;
  status: "Aktif" | "Non-Aktif";
}

export const columns: ColumnDef<JobPosition>[] = [
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
    header: "Keterangan",
    accessorKey: "description",
    size: 30,
  },
];
