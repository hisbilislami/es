import { useFormMetadata } from "@conform-to/react";
import { ActionIcon } from "@mantine/core";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";

import { useDialog } from "~/context/DialogContext";

import { CompanyBaseSchemaType } from "../../schema/company.schema";
import { ContactPersonItem } from "../../schema/contact-person.schema";

import ContactPersonForm from "./form";

const ActionCell = ({ row }: { row: ContactPersonItem }) => {
  const [modalContactPersonEdit, setContactPersonModalEdit] =
    useState<boolean>(false);

  const companyFormMeta =
    useFormMetadata<CompanyBaseSchemaType>("company-form");

  const fields = companyFormMeta.getFieldset().contact_persons;

  const contactPersons = Array.isArray(fields.value)
    ? (fields.value.filter(Boolean) as ContactPersonItem[])
    : [];

  const { showDialog } = useDialog();

  const confirmDelete = () => {
    showDialog({
      title: "Hapus Kontak Person",
      description: "Yakin ingin menghapus kontak person ini ?",
      type: "confirmation",
      onConfirm: () => {
        const updatedContactPersons = contactPersons.filter((c) => {
          return c.id
            ? c.id !== row.id
            : !(c.phone_number === row.phone_number && c.email === row.email);
        });

        companyFormMeta.update({
          name: "contact_persons",
          value: updatedContactPersons,
        });
      },
    });
  };

  return (
    <>
      {modalContactPersonEdit && (
        <ContactPersonForm
          key={row?.id}
          opened={modalContactPersonEdit}
          onClose={() => setContactPersonModalEdit(false)}
          opt={"edit"}
          selectedContactPerson={row}
        />
      )}
      <div className="text-center">
        <ActionIcon
          variant="subtle"
          color="tmDark.8"
          size="md"
          aria-label="Edit"
          onClick={() => {
            setContactPersonModalEdit(true);
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

export const columns: ColumnDef<ContactPersonItem>[] = [
  {
    accessorKey: "id",
    header: "Aksi",
    size: 50,
    enableResizing: true,
    cell: ({ row }) => <ActionCell row={row.original} />,
  },
  {
    header: "Gelar",
    accessorKey: "salutation_name",
    size: 30,
  },
  {
    header: "Nama Depan",
    accessorKey: "first_name",
    size: 50,
  },
  {
    header: "Nama Belakang",
    accessorKey: "last_name",
    size: 50,
  },
  {
    header: "Telepon",
    accessorKey: "phone_number",
    size: 100,
  },
  {
    header: "Email",
    accessorKey: "email",
    size: 50,
  },
];
