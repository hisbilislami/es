import { useFormMetadata } from "@conform-to/react";
import { ActionIcon, Badge, FileButton, Image, Tooltip } from "@mantine/core";
import { useListState } from "@mantine/hooks";
import {
  IconCircleCheck,
  IconEdit,
  IconEye,
  IconTrash,
  IconUpload,
  IconX,
} from "@tabler/icons-react";
import { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";

import TmModal from "~/components/dialog/modal";
import { useDialog } from "~/context/DialogContext";

import { identityItem } from "../schema/identity.schema";
import { UserSignerBaseSchemaType } from "../schema/personal-information.schema";

import UserSignerIdentityForm from "./form";

const ActionCell = ({ row }: { row: identityItem }) => {
  const [modalPersonIdentityEdit, setPersonIdentityModalEdit] =
    useState<boolean>(false);

  const userSignerFormMeta =
    useFormMetadata<UserSignerBaseSchemaType>("user-signer-form");

  const fields = userSignerFormMeta.getFieldset().identities;

  const identities = Array.isArray(fields.value)
    ? (fields.value.filter(Boolean) as identityItem[])
    : [];

  const { showDialog } = useDialog();

  const confirmDelete = () => {
    showDialog({
      title: "Hapus Identitas",
      description: "Yakin ingin menghapus data identitas ini ?",
      type: "confirmation",
      onConfirm: () => {
        const updatedPersonIdentities = identities.filter((c) => {
          return c.id
            ? c.id !== row.id
            : !(
                c.number === row.number && c.identity_type === row.identity_type
              );
        });

        userSignerFormMeta.update({
          name: "identities",
          value: updatedPersonIdentities,
        });
      },
    });
  };

  return (
    <>
      {modalPersonIdentityEdit && (
        <UserSignerIdentityForm
          key={row?.id}
          opened={modalPersonIdentityEdit}
          onClose={() => setPersonIdentityModalEdit(false)}
          opt={"edit"}
          selectedUserSignerIdentity={row}
        />
      )}
      <div className="text-center inline-flex flex-nowrap">
        <Tooltip label="Edit">
          <ActionIcon
            variant="subtle"
            color="tmDark.8"
            size="md"
            aria-label="Edit"
            onClick={() => {
              setPersonIdentityModalEdit(true);
            }}
          >
            <IconEdit />
          </ActionIcon>
        </Tooltip>

        <Tooltip label="Hapus">
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
        </Tooltip>

        {row.primary !== "y" && (
          <Tooltip label="Jadikan Primary">
            <ActionIcon
              variant="subtle"
              color="tmDark.8"
              size="md"
              aria-label="Jadikan Primary"
              onClick={() => {
                const updatedIdentities = identities.map((r) => {
                  const newIdentity = { ...r };

                  if (newIdentity.id && newIdentity.id === row.id) {
                    newIdentity.primary = "y";
                  } else if (
                    !newIdentity.id &&
                    newIdentity.identity_type === row.identity_type &&
                    newIdentity.number === row.number
                  ) {
                    newIdentity.primary = "y";
                  } else {
                    newIdentity.primary = "n";
                  }

                  return newIdentity;
                });

                userSignerFormMeta.update({
                  name: "identities",
                  value: updatedIdentities,
                });
              }}
            >
              <IconCircleCheck />
            </ActionIcon>
          </Tooltip>
        )}
      </div>
    </>
  );
};

const FileAction = ({ row, index }: { row: identityItem; index: number }) => {
  const userSignerFormMeta =
    useFormMetadata<UserSignerBaseSchemaType>("user-signer-form");

  const rawIdentities = userSignerFormMeta.getFieldset().identities.value;
  const initialIdentities: identityItem[] = Array.isArray(rawIdentities)
    ? (rawIdentities.filter(Boolean) as identityItem[])
    : [];

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const [identity, setIdentity] = useListState<identityItem>(initialIdentities);

  const hasFile =
    Boolean(identity[index]?.file_identity) ||
    Boolean(identity[index]?.file_identity_url);

  return (
    <div className="inline-flex justify-center items-center w-full gap-1">
      <Tooltip label="Preview File">
        <ActionIcon
          variant="subtle"
          color="tmDark.8"
          size="md"
          disabled={!hasFile}
          aria-label="See Detail"
          onClick={() => {
            if (hasFile) {
              setIsPreviewOpen(true);
            }
          }}
        >
          <IconEye />
        </ActionIcon>
      </Tooltip>
      <TmModal
        opened={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false);
          if (!row.file_identity_id) {
            const file = identity[index]?.file_identity;
            if (file) {
              const previewUrl = URL.createObjectURL(file);
              URL.revokeObjectURL(previewUrl);
            }
          }
        }}
        title="File Preview"
        hideCloseButton={false}
        size="lg"
      >
        {row.file_identity_id ? (
          <Image
            src={
              !isRawUrl(identity[index].file_identity_url)
                ? row.file_identity_url
                : `/api/img-preview/${identity[index].file_identity_url}`
            }
            // alt={row.file_identity_name}
            alt={
              "identity_images" +
              identity[index].file_identity +
              row.file_identity_id +
              row.file_identity_url
            }
            radius="md"
            fit="contain"
          />
        ) : identity[index]?.file_identity ? (
          identity[index].file_identity.type.startsWith("image/") ? (
            <Image
              src={URL.createObjectURL(identity[index].file_identity)}
              alt={identity[index]?.file_identity_name}
              radius="md"
              fit="contain"
            />
          ) : (
            <object
              data={URL.createObjectURL(identity[index].file_identity)}
              type={identity[index].file_identity.type}
              aria-label={identity[index].file_identity_name}
              width="100%"
              height="600px"
            />
          )
        ) : (
          <p>No file selected.</p>
        )}
      </TmModal>
      <FileButton
        name={`identities[${index}].file_identity`}
        form={userSignerFormMeta.id}
        onChange={(file) => {
          if (!file) return;
          if (Array.isArray(identity)) {
            const updated = identity.map((r, i) =>
              i === index
                ? { ...r, file_identity: file, file_identity_name: file.name }
                : r,
            );
            userSignerFormMeta.update({
              name: "identities",
              value: updated,
            });
            setIdentity.setState(updated);
          }
        }}
      >
        {(props) => (
          <ActionIcon
            {...props}
            variant="subtle"
            color="tmDark.8"
            size="md"
            aria-label="Upload"
          >
            <IconUpload />
          </ActionIcon>
        )}
      </FileButton>
      <Tooltip label="Hapus File">
        <ActionIcon
          variant="subtle"
          color="tmDark.8"
          size="md"
          disabled={!hasFile}
          aria-label="Delete"
          onClick={() => {
            if (Array.isArray(identity)) {
              userSignerFormMeta.update({
                name: userSignerFormMeta
                  .getFieldset()
                  .identities.getFieldList()
                  .at(index)
                  ?.getFieldset().file_identity_name.name,
                value: "",
              });
              userSignerFormMeta.update({
                name: userSignerFormMeta
                  .getFieldset()
                  .identities.getFieldList()
                  .at(index)
                  ?.getFieldset().file_identity.name,
                value: undefined,
              });
              userSignerFormMeta.update({
                name: userSignerFormMeta
                  .getFieldset()
                  .identities.getFieldList()
                  .at(index)
                  ?.getFieldset().file_identity_id.name,
                value: "",
              });
              userSignerFormMeta.update({
                name: userSignerFormMeta
                  .getFieldset()
                  .identities.getFieldList()
                  .at(index)
                  ?.getFieldset().file_identity_url.name,
                value: "",
              });

              const deletedFile = identity.map((r, i) =>
                i === index
                  ? {
                      ...r,
                      file_identity: undefined,
                      file_identity_name: "",
                      file_identity_id: "",
                      file_identity_url: "",
                    }
                  : r,
              );

              // the file_identity, file_identity_id, file_identity_url is exists here.
              userSignerFormMeta.update({
                name: "identities",
                value: deletedFile,
              });

              // the file_identity, file_identity_id, file_identity_url disappear in here..
              setIdentity.setState(deletedFile);
            }
          }}
        >
          <IconX />
        </ActionIcon>
      </Tooltip>
    </div>
  );
};

const isRawUrl = (key?: string | null): boolean => {
  if (!key) return false;
  return key.startsWith("s3/");
};

export const column: ColumnDef<identityItem>[] = [
  {
    header: "Aksi",
    accessorKey: "id",
    size: 100,
    enableResizing: true,
    cell: ({ row }) => <ActionCell row={row.original} />,
  },
  {
    header: "Jenis",
    accessorKey: "identity_type_name",
  },
  {
    header: "Nomor",
    accessorKey: "number",
  },
  {
    header: "Negara Penerbit",
    accessorKey: "country_issuer_name",
  },
  {
    header: "Lembaga Penerbit",
    accessorKey: "issuer",
  },
  {
    header: "Status",
    accessorKey: "primary",
    cell: (rec) => {
      const { primary } = rec.row.original;

      if (primary === "y") {
        return (
          <div className="text-center">
            <Badge color="tmGreen">Primary</Badge>
          </div>
        );
      } else {
        return (
          <div className="text-center">
            <Badge color="tmGray.4" className="text-black">
              -
            </Badge>
          </div>
        );
      }
    },
  },
  {
    header: "Kadaluarsa",
    accessorKey: "expired_date",
  },
  {
    header: "File",
    accessorKey: "identity_file",
    cell: (data) => {
      return <FileAction row={data.row.original} index={data.row.index} />;
    },
  },
];
