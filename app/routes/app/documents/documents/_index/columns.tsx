import { Badge, Button, Group } from "@mantine/core";
import { IconSend, IconTrash } from "@tabler/icons-react";
import { ColumnDef } from "@tanstack/react-table";
import PDFThumbnail from "~/components/pdf/pdf-thumbnail";

export interface ListDocuments {
  id: number;
  name: string;
  updated_at: string;
  status: string;
  file_url: string;
}

export const columns: ColumnDef<ListDocuments>[] = [
  {
    header: "Pratinjau",
    accessorKey: "preview",
    enableResizing: false,
    cell: ({ row }) => {
      const url = `/api/proxy-pdf?url=${encodeURIComponent(row.original.file_url)}`;

      return <PDFThumbnail url={url} />;
    },
    size: 1,
    minSize: 1,
  },
  {
    header: "Nama Dokumen",
    accessorKey: "name",
    size: 150,
  },
  {
    header: "Pembaruan Terakhir",
    accessorKey: "updated_at",
    size: 60,
  },
  {
    header: "Status",
    accessorKey: "status",
    size: 10,
    cell: ({ row }) => {
      const status = row.original.status;

      let color = "yellow";
      let textStatus = "Ditunda";
      switch (status) {
        case "pending":
          color = "yellow";
          textStatus = "Ditunda";
          break;
        case "done":
          color = "blue";
          textStatus = "Selesai";
          break;
        case "reject":
          color = "red";
          textStatus = "Ditolak";
          break;
        case "expired":
          color = "gray";
          textStatus = "Kedaluwarsa";
          break;

        default:
          break;
      }

      return (
        <div className="w-full inline-flex justify-center items-center">
          <Badge
            variant="light"
            className="font-normal"
            radius="sm"
            color={color}
          >
            {textStatus}
          </Badge>
        </div>
      );
    },
  },
  {
    header: "Aksi",
    accessorKey: "action",
    size: 10,
    cell: ({ row }) => (
      <Group
        gap="xs"
        className="inline-flex justify-center items-center w-full"
      >
        <Button
          variant="outline"
          color="tmGray"
          className="text-[#141517]"
          size="xs"
          onClick={() => {}}
        >
          <IconSend color="#141517" height={12} />
          Kirim
        </Button>
        <Button
          variant="outline"
          color="tmGray"
          size="xs"
          className="text-[#141517]"
          onClick={() => {}}
        >
          <IconTrash color="#141517" height={12} />
          Hapus
        </Button>
      </Group>
    ),
  },
];
