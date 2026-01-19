import { ColumnDef } from "@tanstack/react-table";

export interface UserSigner {
  id: number;
  name: string;
  type: string;
  email: string;
  medical_record_number: string;
  active: string;
}

export const columns: ColumnDef<UserSigner>[] = [
  {
    header: "Name",
    accessorKey: "name",
    cell: ({ row }) => {
      const { name } = row.original;
      return <span className="whitespace-nowrap capitalize">{name}</span>;
    },
  },
  {
    header: "Jenis User Signer",
    accessorKey: "type",
    cell: ({ row }) => {
      return <span className="capitalize">{row.original.type}</span>;
    },
  },
  {
    header: "Email",
    accessorKey: "email",
  },
  {
    header: "Medical Record Number",
    accessorKey: "medical_record_number",
  },
];
