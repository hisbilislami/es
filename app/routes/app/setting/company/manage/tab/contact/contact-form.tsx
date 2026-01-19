import {
  FormProvider,
  getFormProps,
  getInputProps,
  useForm,
  useFormMetadata,
  useInputControl,
} from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Button, Divider } from "@mantine/core";
import { useListState } from "@mantine/hooks";
import { Form, useNavigation } from "@remix-run/react";

import TmModal from "~/components/dialog/modal";
import InputSelect from "~/components/form/input-select";
import InputText from "~/components/form/input-text";

import { CompanyBaseSchemaType } from "../../schema/company.schema";
import { ContactItem, ContactItemSchema } from "../../schema/contact.schema";

import { contactFormLabel } from "./constant";

type Props = {
  selectedContact?: ContactItem;
  opened: boolean;
  onClose: () => void;
  opt: "edit" | "new";
};

export const action = () => {
  return null;
};

const ContactForm = ({
  selectedContact,
  opened,
  onClose,
  opt = "new",
}: Props) => {
  const companyFormMeta =
    useFormMetadata<CompanyBaseSchemaType>("company-form");

  const rawContacts = companyFormMeta.getFieldset().contacts.value;
  const initialContacts: ContactItem[] = Array.isArray(rawContacts)
    ? (rawContacts.filter(Boolean) as ContactItem[])
    : [];

  const [contacts, setContacts] = useListState<ContactItem>(initialContacts);

  const [form, fields] = useForm({
    id: `contact-${opt}-form`,
    constraint: getZodConstraint(ContactItemSchema),
    defaultValue: opt === "new" ? ({} as ContactItem) : (selectedContact ?? {}),
    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema: ContactItemSchema,
      });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
    onSubmit(e, { formData }) {
      e.preventDefault();

      const newContactData: ContactItem = {
        contact_type: formData.get("contact_type")?.toString() || "",
        description: formData.get("description")?.toString() || "",
        contact_type_name: formData.get("contact_type_name")?.toString() || "",
        primary: formData.get("primary")?.toString() || "0",
        id: formData.get("id")?.toString(),
      };

      // This is how to avoid the race condition between local state and parent form state

      let updatedContacts = [...contacts]; // Create a copy of the current state

      if (opt === "new") {
        updatedContacts = [...updatedContacts, newContactData]; // Append to the copy
      } else {
        const contactId = selectedContact?.id;
        let stateIndex = 0;
        if (contactId) {
          stateIndex = updatedContacts.findIndex((c) => c.id === contactId);
        } else {
          stateIndex = updatedContacts.findIndex(
            (c) =>
              c.contact_type === selectedContact!.contact_type &&
              c.description === selectedContact!.description,
          );
        }
        updatedContacts.splice(stateIndex, 1, newContactData); // Update the copy
      }

      // Now, call the state update with the *newly updated* data.
      companyFormMeta.update({
        name: "contacts",
        value: updatedContacts,
      });

      setContacts.setState(updatedContacts);

      form.reset();
      onClose();
    },
  });

  const navigation = useNavigation();

  const contactType = useInputControl(fields.contact_type);
  const { key: keyContactTypeName, ...restContactTypeName } = getInputProps(
    fields.contact_type_name,
    { type: "hidden" },
  );

  const { key: keyId, ...restId } = getInputProps(fields.id, {
    type: "hidden",
  });

  return (
    <>
      <TmModal
        title={opt === "new" ? "Kontak Baru" : "Edit Kontak"}
        opened={opened}
        onClose={onClose}
        hideCloseButton={false}
        size="400"
        paddingContent="px-0 py-4"
      >
        <FormProvider context={form.context}>
          <Form
            method="POST"
            {...getFormProps(form)}
            id={form.id}
            key={selectedContact?.id || "new-contact"}
          >
            <div className="py-3 px-5">
              <InputSelect
                {...contactFormLabel["contact_type"]}
                remountKey={contactType.value}
                fields={fields}
                searchable
                value={contactType.value}
                onFocus={contactType.focus}
                onChange={(value, opt) => {
                  if (value) {
                    form.update({
                      name: "contact_type_name",
                      value: opt.label,
                    });
                  }
                }}
                selectFirstOptionOnChange
                onBlur={contactType.blur}
                dataFetch={{
                  urlPath: "api/contact-type",
                  keys: { label: "name", value: "id" },
                  dataKeys: "data",
                }}
                allowDeselect
                skipLimit={!!contactType.value}
              />
              <input key={keyContactTypeName} {...restContactTypeName} />
              <input key={keyId} {...restId} />
              <InputText fields={fields} {...contactFormLabel["description"]} />
            </div>
          </Form>
          <Divider my="sm" className="!w-full" />
          <div className="inline-flex justify-end w-full px-4 items-center gap-3">
            <Button
              type="button"
              size="xs"
              leftSection={<Icon icon="tabler:x" className="h-5 w-5" />}
              variant="default"
              onClick={onClose}
              loading={navigation.state !== "idle"}
            >
              Batal
            </Button>
            <Button
              type="submit"
              form={form.id}
              size="xs"
              leftSection={
                <Icon icon="tabler:device-floppy" className="h-5 w-5" />
              }
              color="tmBlue"
              loading={navigation.state !== "idle"}
            >
              Simpan
            </Button>
          </div>
        </FormProvider>
      </TmModal>
    </>
  );
};

export default ContactForm;
