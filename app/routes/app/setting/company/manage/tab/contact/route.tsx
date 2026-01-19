import { useFormMetadata } from "@conform-to/react";
import { LoaderFunctionArgs } from "@remix-run/node";
import { useLocation, useSearchParams } from "@remix-run/react";
import { Fragment, useState } from "react";

import { DataTable, useDataTable } from "~/components/table";

import { CompanyBaseSchemaType } from "../../schema/company.schema";
import { ContactItem } from "../../schema/contact.schema";

import { columns, CompanyContact } from "./column";
import ContactForm from "./contact-form";
import { loaderHandler } from "./loader";

export const loader = ({ request }: LoaderFunctionArgs, id: number) => {
  return loaderHandler(request, id);
};

const ContactPage = () => {
  const companyFormMeta =
    useFormMetadata<CompanyBaseSchemaType>("company-form");
  const fields = companyFormMeta.getFieldset().contacts;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchText, setSearchText] = useState("");

  const contacts = Array.isArray(fields.value)
    ? (fields.value.filter(Boolean) as ContactItem[])
    : [];

  const filteredContacts = contacts.filter(
    (contact) =>
      contact?.contact_type_name
        ?.toLowerCase()
        .includes(searchText.toLowerCase()) ||
      contact?.description?.toLowerCase().includes(searchText.toLowerCase()),
  );

  const { table } = useDataTable({
    columns: columns,
    data: filteredContacts as CompanyContact[],
    count: filteredContacts.length,
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
      {contacts?.map((p, i) => (
        <Fragment key={`contact-${i}`}>
          <input
            key={`contacts-id-${i}`}
            type="hidden"
            name={`contacts[${i}].id`}
            value={p.id}
            form={companyFormMeta.id}
          />
          <input
            key={`contacts-contact-type-${i}`}
            type="hidden"
            name={`contacts[${i}].contact_type`}
            value={p.contact_type}
            form={companyFormMeta.id}
          />
          <input
            key={`contacts-contact-type-name-${i}`}
            type="hidden"
            name={`contacts[${i}].contact_type_name`}
            value={p.contact_type_name}
            form={companyFormMeta.id}
          />
          <input
            key={`contacts-description-${i}`}
            type="hidden"
            name={`contacts[${i}].description`}
            value={p.description}
            form={companyFormMeta.id}
          />
          <input
            key={`contacts-primary-${i}`}
            type="hidden"
            name={`contacts[${i}].primary`}
            value={p.primary}
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
          textName="Kontak"
          onAdd={handleOpenNew}
          withSearchField={true}
          onSearch={handleSearch}
          onRefresh={handleRefresh}
        />
      </div>
      {isModalOpen && (
        <ContactForm
          key={"new-contact"}
          opened={isModalOpen}
          onClose={handleClose}
          opt={"new"}
          selectedContact={undefined}
        />
      )}
    </>
  );
};

export default ContactPage;
