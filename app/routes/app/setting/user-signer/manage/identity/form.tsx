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
import InputDate from "~/components/form/input-date";
import InputNumber from "~/components/form/input-number";
import InputSelect from "~/components/form/input-select";
import InputText from "~/components/form/input-text";

import {
  identityItem,
  identityLabel,
  identitySchema,
} from "../schema/identity.schema";
import { UserSignerBaseSchemaType } from "../schema/personal-information.schema";

type Props = {
  selectedUserSignerIdentity?: identityItem;
  opened: boolean;
  onClose: () => void;
  opt: "edit" | "new";
};

const UserSignerIdentityForm = ({
  selectedUserSignerIdentity,
  opened,
  onClose,
  opt = "new",
}: Props) => {
  const userSignerFormMeta =
    useFormMetadata<UserSignerBaseSchemaType>("user-signer-form");

  const rawIdentities = userSignerFormMeta.getFieldset().identities.value;

  const initialIdentities: identityItem[] = Array.isArray(rawIdentities)
    ? (rawIdentities.filter(Boolean) as identityItem[])
    : [];

  const [identity, setIdentity] = useListState<identityItem>(initialIdentities);

  const [form, fields] = useForm({
    id: `user-signer-identity-${opt}-form`,
    constraint: getZodConstraint(identitySchema),
    defaultValue:
      opt === "new" ? ({} as identityItem) : (selectedUserSignerIdentity ?? {}),
    onValidate({ formData }) {
      const valid = parseWithZod(formData, {
        schema: identitySchema,
      });

      return valid;
    },
    shouldRevalidate: "onInput",
    shouldValidate: "onBlur",
    onSubmit(e, { formData, submission }) {
      e.preventDefault();

      const newPersonIdentity: identityItem = {
        identity_type: formData.get("identity_type")?.toString() || "",
        identity_type_name:
          formData.get("identity_type_name")?.toString() || "",
        country_issuer: formData.get("country_issuer")?.toString() || "",
        country_issuer_name:
          formData.get("country_issuer_name")?.toString() || "",
        issuer: formData.get("issuer")?.toString() || "",
        number: formData.get("number")?.toString() || "",
        primary: "n",
        expired_date: formData.get("expired_date")?.toString() || "",
        id: formData.get("id") ? Number(formData.get("id")) : undefined,
      };

      let updatedPersonIdentity = [...identity];

      if (opt === "new") {
        updatedPersonIdentity = [...updatedPersonIdentity, newPersonIdentity];
      } else {
        const personIdentityId = selectedUserSignerIdentity?.id;
        let stateIndex = 0;
        if (personIdentityId) {
          stateIndex = updatedPersonIdentity.findIndex(
            (c) => c.id === personIdentityId,
          );
        } else {
          stateIndex = updatedPersonIdentity.findIndex(
            (c) =>
              c.number === selectedUserSignerIdentity!.number &&
              c.identity_type === selectedUserSignerIdentity!.identity_type,
          );
        }

        const updatedItems = submission?.payload;

        // updatedPersonIdentity.splice(stateIndex, 1, newPersonIdentity);
        updatedPersonIdentity = updatedPersonIdentity.map((item, idx) =>
          idx === stateIndex ? { ...item, ...updatedItems } : item,
        );
      }

      userSignerFormMeta.update({
        name: "identities",
        value: updatedPersonIdentity,
      });

      setIdentity.setState(updatedPersonIdentity);

      form.reset();
      onClose();
    },
  });

  const navigation = useNavigation();

  const identityType = useInputControl(fields.identity_type);

  const countryIssuer = useInputControl(fields.country_issuer);

  const { key: keyId, ...restId } = getInputProps(fields.id, {
    type: "hidden",
  });
  const { key: keyCountryIssuerName, ...restCountryIssuerName } = getInputProps(
    fields.country_issuer_name,
    {
      type: "hidden",
    },
  );
  const { key: keyIdentityTypeName, ...restIdentityTypeName } = getInputProps(
    fields.identity_type_name,
    {
      type: "hidden",
    },
  );

  return (
    <TmModal
      opened={opened}
      onClose={onClose}
      hideCloseButton={true}
      paddingContent="p-4"
      title={opt === "new" ? "Tambah identitas baru" : "Edit identitas"}
    >
      <FormProvider context={form.context}>
        <Form
          method="POST"
          {...getFormProps(form)}
          id={form.id}
          encType="multipart/form-data"
          key={selectedUserSignerIdentity?.id || "new-identity"}
        >
          <div className="py-3 px-5">
            <InputSelect
              {...identityLabel["identity_type"]}
              remountKey={identityType.value}
              fields={fields}
              searchable
              value={identityType.value}
              onFocus={identityType.focus}
              onChange={(value, opt) => {
                if (value) {
                  form.update({
                    name: "identity_type_name",
                    value: opt.label,
                  });
                }
              }}
              selectFirstOptionOnChange
              onBlur={identityType.blur}
              dataFetch={{
                urlPath: "api/identity-type",
                keys: { label: "name", value: "id" },
                dataKeys: "data",
              }}
              allowDeselect
              skipLimit={!!identityType.value}
            />
            <input key={keyId} {...restId} />
            <input key={keyCountryIssuerName} {...restCountryIssuerName} />
            <input key={keyIdentityTypeName} {...restIdentityTypeName} />
            <InputNumber fields={fields} {...identityLabel["number"]} />
            <InputSelect
              {...identityLabel["country_issuer"]}
              remountKey={countryIssuer.value}
              fields={fields}
              searchable={true}
              value={countryIssuer.value}
              onFocus={countryIssuer.focus}
              onChange={(value, opt) => {
                if (value) {
                  form.update({
                    name: "country_issuer_name",
                    value: opt.label,
                  });
                }
              }}
              selectFirstOptionOnChange={true}
              onBlur={() => {
                return countryIssuer.blur;
              }}
              dataFetch={{
                urlPath: "api/country",
                keys: { label: "name", value: "id" },
                dataKeys: "data",
              }}
              allowDeselect
              skipLimit={countryIssuer.value ? true : false}
            />
            <InputText fields={fields} {...identityLabel["issuer"]} />
            <InputDate fields={fields} {...identityLabel["expired_date"]} />
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
  );
};

export default UserSignerIdentityForm;
