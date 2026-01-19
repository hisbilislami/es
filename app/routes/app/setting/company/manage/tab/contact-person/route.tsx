import { useFormMetadata } from "@conform-to/react";
import { useLocation, useSearchParams } from "@remix-run/react";
import { Fragment, useState } from "react";

import { DataTable, useDataTable } from "~/components/table";

import { CompanyBaseSchemaType } from "../../schema/company.schema";
import { ContactPersonItem } from "../../schema/contact-person.schema";

import { columns } from "./column";
import ContactPersonForm from "./form";

const ContactPersonPage = () => {
  const companyFormMeta =
    useFormMetadata<CompanyBaseSchemaType>("company-form");
  const fields = companyFormMeta.getFieldset().contact_persons;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchText, setSearchText] = useState("");

  const contactPersons = Array.isArray(fields.value)
    ? (fields.value.filter(Boolean) as ContactPersonItem[])
    : [];

  const filteredContactPersons = contactPersons.filter(
    (contactPerson) =>
      contactPerson?.salutation_name
        ?.toLowerCase()
        .includes(searchText.toLowerCase()) ||
      contactPerson?.first_name
        ?.toLowerCase()
        .includes(searchText.toLowerCase()) ||
      contactPerson?.last_name
        ?.toLowerCase()
        .includes(searchText.toLowerCase()) ||
      contactPerson?.phone_number
        ?.toLowerCase()
        .includes(searchText.toLowerCase()) ||
      contactPerson?.email?.toLowerCase().includes(searchText.toLowerCase()),
  );

  const { table } = useDataTable({
    columns: columns,
    data: filteredContactPersons as ContactPersonItem[],
    count: filteredContactPersons.length || 0,
    isLoading: false,
  });

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
    <>
      {contactPersons?.map((p, i) => (
        <Fragment key={`contact-person-${i}`}>
          <input
            key={`contact-persons-id-${i}`}
            type="hidden"
            name={`contact_persons[${i}].id`}
            value={p.id}
            form={companyFormMeta.id}
          />
          <input
            key={`contact-persons-salutation-${i}`}
            type="hidden"
            name={`contact_persons[${i}].salutation`}
            value={p.salutation}
            form={companyFormMeta.id}
          />
          <input
            key={`contact-persons-salutation-name-${i}`}
            type="hidden"
            name={`contact_persons[${i}].salutation_name`}
            value={p.salutation_name}
            form={companyFormMeta.id}
          />
          <input
            key={`contact-persons-first-name-${i}`}
            type="hidden"
            name={`contact_persons[${i}].first_name`}
            value={p.first_name}
            form={companyFormMeta.id}
          />
          <input
            key={`contact-persons-last-name-${i}`}
            type="hidden"
            name={`contact_persons[${i}].last_name`}
            value={p.last_name}
            form={companyFormMeta.id}
          />
          <input
            key={`contact-persons-phone-number-${i}`}
            type="hidden"
            name={`contact_persons[${i}].phone_number`}
            value={p.phone_number}
            form={companyFormMeta.id}
          />
          <input
            key={`contact-persons-email-${i}`}
            type="hidden"
            name={`contact_persons[${i}].email`}
            value={p.email}
            form={companyFormMeta.id}
          />
        </Fragment>
      ))}

      <div className="py-4">
        <DataTable
          table={table}
          columns={columns}
          withAction={true}
          gridAction={false}
          textName="Kontak Person"
          onAdd={handleOpenNew}
          withSearchField={true}
          onSearch={handleSearch}
          onRefresh={handleRefresh}
        ></DataTable>
      </div>
      {isModalOpen && (
        <ContactPersonForm
          key={"new-contact-person"}
          opened={isModalOpen}
          onClose={handleClose}
          opt={"new"}
          selectedContactPerson={undefined}
        />
      )}
    </>
  );
};

export default ContactPersonPage;
