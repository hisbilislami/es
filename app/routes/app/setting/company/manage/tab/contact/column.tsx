import { useFormMetadata } from "@conform-to/react";
import { ActionIcon } from "@mantine/core";
import { IconCircleCheck, IconEdit, IconTrash } from "@tabler/icons-react";
import { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";

import { useDialog } from "~/context/DialogContext";

import { CompanyBaseSchemaType } from "../../schema/company.schema";
import { ContactItem } from "../../schema/contact.schema";

import ContactForm from "./contact-form";

export interface CompanyContact {
  id?: string;
  contact_type: string;
  contact_type_name: string;
  primary: string;
  description: string;
}

const ActionCell = ({ row }: { row: CompanyContact }) => {
  const [modalEditOpened, setModalEditOpened] = useState<boolean>(false);

  const companyFormMeta =
    useFormMetadata<CompanyBaseSchemaType>("company-form");

  const fields = companyFormMeta.getFieldset().contacts;

  const contacts = Array.isArray(fields.value)
    ? (fields.value.filter(Boolean) as ContactItem[])
    : [];

  const { showDialog } = useDialog();

  const confirmDelete = () => {
    showDialog({
      title: "Hapus Kontak",
      description: "Yakin ingin menghapus kontak ini ?",
      type: "confirmation",
      onConfirm: () => {
        const updatedContacts = contacts.filter((c) => {
          return c.id
            ? c.id !== row.id
            : !(
                c.contact_type === row.contact_type &&
                c.description === row.description
              );
        });

        companyFormMeta.update({
          name: "contacts",
          value: updatedContacts,
        });
      },
    });
  };

  return (
    <>
      {modalEditOpened && (
        <ContactForm
          key={row?.id}
          opened={modalEditOpened}
          onClose={() => setModalEditOpened(false)}
          opt={"edit"}
          selectedContact={row}
        />
      )}
      <div className="text-center">
        <ActionIcon
          variant="subtle"
          color="tmDark.8"
          hidden={row.primary === "1"}
          size="md"
          aria-label="Jadikan Primary"
          onClick={() => {
            const updatedContacts = contacts.map((r) => {
              const newContact = { ...r };

              if (newContact.id && newContact.id === row.id) {
                newContact.primary = "1";
              } else if (
                !newContact.id &&
                newContact.contact_type === row.contact_type &&
                newContact.description === row.description
              ) {
                newContact.primary = "1";
              } else {
                newContact.primary = "0";
              }
              return newContact;
            });

            companyFormMeta.update({
              name: "contacts",
              value: updatedContacts,
            });
          }}
        >
          <IconCircleCheck />
        </ActionIcon>
        <ActionIcon
          variant="subtle"
          color="tmDark.8"
          size="md"
          aria-label="Edit"
          onClick={() => {
            setModalEditOpened(true);
          }}
        >
          <IconEdit />
        </ActionIcon>
        <ActionIcon
          variant="subtle"
          color="tmDark.8"
          size="md"
          aria-label="Delete"
          onClick={() => {
            confirmDelete();
          }}
        >
          <IconTrash />
        </ActionIcon>
      </div>
    </>
  );
};

export const columns: ColumnDef<CompanyContact>[] = [
  {
    accessorKey: "id",
    header: "Aksi",
    size: 50,
    enableResizing: true,
    cell: ({ row }) => <ActionCell row={row.original} />,
  },
  {
    header: "Jenis Kontak",
    accessorKey: "contact_type_name",
    size: 100,
  },
  {
    header: "Deskripsi",
    accessorKey: "description",
    size: 100,
  },
  {
    header: "Primary",
    accessorKey: "primary",
    enableResizing: true,
    cell: ({ row }) => {
      const primary = row.original.primary;
      return (
        <>
          <span>{primary === "1" ? "Primary" : "-"}</span>
        </>
      );
    },
    size: 50,
  },
];
