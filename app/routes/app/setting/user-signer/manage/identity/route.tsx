import { useFormMetadata } from "@conform-to/react";
import { useLocation, useSearchParams } from "@remix-run/react";
import { Fragment, useState } from "react";

import { DataTable, useDataTable } from "~/components/table";

import { identityItem } from "../schema/identity.schema";
import { UserSignerBaseSchemaType } from "../schema/personal-information.schema";

import { column } from "./column";
import UserSignerIdentityForm from "./form";

export const action = () => {
  return null;
};

const UserSignerIdentity = () => {
  const userSignerFormMeta =
    useFormMetadata<UserSignerBaseSchemaType>("user-signer-form");
  const fields = userSignerFormMeta.getFieldset().identities;

  const [searchText, setSearchText] = useState("");

  const personIdentities = Array.isArray(fields.value)
    ? (fields.value.filter(Boolean) as identityItem[])
    : [];

  const filteredPersonIdentities = personIdentities.filter(
    (personIdentity) =>
      personIdentity?.number
        ?.toLowerCase()
        .includes(searchText.toLowerCase()) ||
      personIdentity?.issuer?.toLowerCase().includes(searchText.toLowerCase()),
  );

  const { table } = useDataTable({
    columns: column,
    data: filteredPersonIdentities as identityItem[],
    count: filteredPersonIdentities.length || 0,
    isLoading: false,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClose = () => {
    setIsModalOpen(false);
  };

  const handleOpenNew = () => {
    setIsModalOpen(true);
  };

  const [searchParams] = useSearchParams();

  const handleSearch = (query: string) => {
    const params = new URLSearchParams(searchParams);

    if (query) {
      params.set("kq", query);
    } else {
      params.delete("kq");
    }

    setSearchText(query);
  };

  const location = useLocation();
  const handleRefresh = () => {
    const params = new URLSearchParams(location.search);
    params.delete("kq");

    setSearchText("");
  };

  return (
    <div className="p-2 overflow-x-auto">
      {personIdentities?.map((p, i) => (
        <Fragment key={`person-identity-${i}`}>
          <input
            key={`person-identities-id-${i}`}
            type="hidden"
            name={`identities[${i}].id`}
            value={p.id}
            form={userSignerFormMeta.id}
          />
          <input
            key={`person-identities-type-name-${i}`}
            type="hidden"
            name={`identities[${i}].identity_type_name`}
            value={p.identity_type_name}
            form={userSignerFormMeta.id}
          />
          <input
            key={`person-identities-type-${i}`}
            type="hidden"
            name={`identities[${i}].identity_type`}
            value={p.identity_type}
            form={userSignerFormMeta.id}
          />
          <input
            key={`person-identities-number-${i}`}
            type="hidden"
            name={`identities[${i}].number`}
            value={p.number}
            form={userSignerFormMeta.id}
          />
          <input
            key={`person-identities-country-issuer-${i}`}
            type="hidden"
            name={`identities[${i}].country_issuer`}
            value={p.country_issuer}
            form={userSignerFormMeta.id}
          />
          <input
            key={`person-identities-country-issuer-name-${i}`}
            type="hidden"
            name={`identities[${i}].country_issuer_name`}
            value={p.country_issuer_name}
            form={userSignerFormMeta.id}
          />
          <input
            key={`person-identities-issuer-${i}`}
            type="hidden"
            name={`identities[${i}].issuer`}
            value={p.issuer}
            form={userSignerFormMeta.id}
          />
          <input
            key={`person-identities-primary-${i}`}
            type="hidden"
            name={`identities[${i}].primary`}
            value={p.primary}
            form={userSignerFormMeta.id}
          />
          <input
            key={`person-identities-expired-date-${i}`}
            type="hidden"
            name={`identities[${i}].expired_date`}
            value={p.expired_date}
            form={userSignerFormMeta.id}
          />
          <input
            key={`person-identities-file-identity-id-${i}`}
            type="hidden"
            name={`identities[${i}].file_identity_id`}
            value={p.file_identity_id ?? ""}
            form={userSignerFormMeta.id}
          />
          <input
            key={`person-identities-file-identity-name-${i}`}
            type="hidden"
            name={`identities[${i}].file_identity_name`}
            value={p.file_identity_name ?? ""}
            form={userSignerFormMeta.id}
          />
          <input
            key={`person-identities-file-identity-url-${i}`}
            type="hidden"
            name={`identities[${i}].file_identity_url`}
            value={p.file_identity_url ?? ""}
            form={userSignerFormMeta.id}
          />
        </Fragment>
      ))}

      <DataTable
        table={table}
        textName="Identitas"
        columns={column}
        withAction={true}
        gridAction={false}
        onAdd={handleOpenNew}
        withSearchField={true}
        onSearch={handleSearch}
        onRefresh={handleRefresh}
      ></DataTable>
      {isModalOpen && (
        <UserSignerIdentityForm
          key={"new-user-signer-identity"}
          opened={isModalOpen}
          onClose={handleClose}
          opt={"new"}
          selectedUserSignerIdentity={undefined}
        />
      )}
    </div>
  );
};

export default UserSignerIdentity;
