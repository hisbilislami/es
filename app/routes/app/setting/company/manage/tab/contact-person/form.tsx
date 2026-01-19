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
import InputNumber from "~/components/form/input-number";
import InputSelect from "~/components/form/input-select";
import InputText from "~/components/form/input-text";

import { CompanyBaseSchemaType } from "../../schema/company.schema";
import {
  ContactPersonItem,
  ContactPersonItemSchema,
} from "../../schema/contact-person.schema";

import { contactPersonFormLabel } from "./constant";

type Props = {
  selectedContactPerson?: ContactPersonItem;
  opened: boolean;
  onClose: () => void;
  opt: "edit" | "new";
};

export const action = () => {
  return null;
};

const ContactPersonForm = ({
  selectedContactPerson,
  opened,
  onClose,
  opt = "new",
}: Props) => {
  const companyFormMeta =
    useFormMetadata<CompanyBaseSchemaType>("company-form");

  const rawContactPersons = companyFormMeta.getFieldset().contact_persons.value;
  const initialContactPersons: ContactPersonItem[] = Array.isArray(
    rawContactPersons,
  )
    ? (rawContactPersons.filter(Boolean) as ContactPersonItem[])
    : [];

  const [contactPersons, setContactPerson] = useListState<ContactPersonItem>(
    initialContactPersons,
  );

  const [form, fields] = useForm({
    id: `contact-person-${opt}-form`,
    constraint: getZodConstraint(ContactPersonItemSchema),
    defaultValue:
      opt === "new" ? ({} as ContactPersonItem) : (selectedContactPerson ?? {}),
    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema: ContactPersonItemSchema,
      });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
    onSubmit(e, { formData }) {
      e.preventDefault();

      const newContactPersonData: ContactPersonItem = {
        salutation: formData.get("salutation")?.toString() || "",
        salutation_name: formData.get("salutation_name")?.toString() || "",
        first_name: formData.get("first_name")?.toString() || "",
        last_name: formData.get("last_name")?.toString() || "",
        phone_number: formData.get("phone_number")?.toString() || "",
        email: formData.get("email")?.toString() || "",
        id: formData.get("id")?.toString(),
      };

      let updatedContactPersons = [...contactPersons];

      if (opt === "new") {
        updatedContactPersons = [
          ...updatedContactPersons,
          newContactPersonData,
        ];
      } else {
        const contactPersonId = selectedContactPerson?.id;
        let stateIndex = 0;
        if (contactPersonId) {
          stateIndex = updatedContactPersons.findIndex(
            (c) => c.id === contactPersonId,
          );
        } else {
          stateIndex = updatedContactPersons.findIndex(
            (c) =>
              c.phone_number === selectedContactPerson!.phone_number &&
              c.email === selectedContactPerson!.email,
          );
        }
        updatedContactPersons.splice(stateIndex, 1, newContactPersonData);
      }

      companyFormMeta.update({
        name: "contact_persons",
        value: updatedContactPersons,
      });

      setContactPerson.setState(updatedContactPersons);

      form.reset();
      onClose();
    },
  });

  const navigation = useNavigation();

  const salutation = useInputControl(fields.salutation);
  const { key: keySalutationName, ...restSalutationName } = getInputProps(
    fields.salutation_name,
    { type: "hidden" },
  );

  const { key: keyId, ...restId } = getInputProps(fields.id, {
    type: "hidden",
  });

  return (
    <>
      <TmModal
        title={opt === "new" ? "Kontak Person Baru" : "Edit Kontak Person"}
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
            key={selectedContactPerson?.id || "new-contact"}
          >
            <div className="py-3 px-5">
              <InputSelect
                {...contactPersonFormLabel["salutation"]}
                remountKey={salutation.value}
                fields={fields}
                searchable
                value={salutation.value}
                onFocus={salutation.focus}
                onChange={(value, opt) => {
                  if (value) {
                    form.update({
                      name: "salutation_name",
                      value: opt.label,
                    });
                  }
                }}
                selectFirstOptionOnChange
                onBlur={salutation.blur}
                dataFetch={{
                  urlPath: "api/salutation",
                  keys: { label: "name", value: "id" },
                  dataKeys: "data",
                }}
                allowDeselect
                skipLimit={!!salutation.value}
              />
              <input key={keySalutationName} {...restSalutationName} />
              <input key={keyId} {...restId} />
              <InputText
                fields={fields}
                {...contactPersonFormLabel["firstName"]}
              />
              <InputText
                fields={fields}
                {...contactPersonFormLabel["lastName"]}
              />
              <InputNumber
                fields={fields}
                hideControls
                allowLeadingZeros={true}
                trimLeadingZeroesOnBlur={false}
                allowDecimal
                {...contactPersonFormLabel["phone_number"]}
              />
              <InputText fields={fields} {...contactPersonFormLabel["email"]} />
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

export default ContactPersonForm;
