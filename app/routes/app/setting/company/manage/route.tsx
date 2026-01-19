import {
  FormProvider,
  getFormProps,
  getInputProps,
  useForm,
  useInputControl,
} from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Button, Radio, Tabs } from "@mantine/core";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigate,
  useNavigation,
} from "@remix-run/react";
import { IconMap, IconPhoneCall, IconUser } from "@tabler/icons-react";

import AppCardForm from "~/components/card/app-card-form";
import InputDate from "~/components/form/input-date";
import InputNumber from "~/components/form/input-number";
import InputRadio from "~/components/form/input-radio";
import InputText from "~/components/form/input-text";

import { actionHandler } from "./action";
import { loaderHandler } from "./loader";
import { companyFormLabel, CompanySchema } from "./schema/company.schema";
import CompanyAddressTabPanel from "./tab/address/route";
import ContactPage from "./tab/contact/route";
import ContactPersonPage from "./tab/contact-person/route";

export const action = ({ request }: ActionFunctionArgs) => {
  return actionHandler(request);
};

export const loader = ({ request }: LoaderFunctionArgs) => {
  return loaderHandler(request);
};

const CompanyForm = () => {
  const lastResult = useActionData<typeof action>();
  const data = useLoaderData<typeof loader>();

  const company = data.data;

  const navigation = useNavigation();
  const navigate = useNavigate();

  const [form, fields] = useForm({
    id: "company-form",
    lastResult,
    constraint: getZodConstraint(CompanySchema(null)),
    shouldValidate: "onBlur",
    shouldRevalidate: "onBlur",
    onValidate({ formData }) {
      const val = parseWithZod(formData, {
        schema: (intent) => {
          return CompanySchema(intent);
        },
      });
      return val;
    },
    defaultValue: {
      id: company?.id,
      code: company?.code,
      name: company?.name,
      display_name: company?.display_name,
      phone_number: company?.phone_number,
      email: company?.email,
      registered_number: company?.registered_number,
      registered_date: company?.registered_date,
      active: company ? (company.active ? "y" : "n") : "y",
      shipping_address: company?.shipping_address,
      billing_address: company?.billing_address,
      contacts: company?.contacts,
      contact_persons: company?.contact_persons,
    },
  });

  const active = useInputControl(fields.active);

  return (
    <>
      <FormProvider context={form.context}>
        <Form
          method="POST"
          {...getFormProps(form)}
          action="/app/setting/company/manage"
        />
        <AppCardForm
          isForm={true}
          title="Form Master Company Profile"
          actionButtons={
            <div className="inline-flex gap-3">
              <Button
                type="button"
                size="xs"
                leftSection={<Icon icon="tabler:x" className="h-5 w-5" />}
                variant="default"
                onClick={() => navigate("/app/setting/company")}
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
          }
        >
          <div className="grid grid-cols-2">
            <div className="p-5">
              <input
                {...getInputProps(fields.id, { type: "hidden" })}
                key={`company-form-${fields.id.initialValue ?? "no-id"}`}
              />
              <InputText
                fields={fields}
                {...companyFormLabel["code"]}
                my="sm"
              />
              <InputText
                fields={fields}
                {...companyFormLabel["name"]}
                my="sm"
              />
              <InputText
                fields={fields}
                {...companyFormLabel["display_name"]}
                my="sm"
              />
              <InputNumber
                {...companyFormLabel["phone_number"]}
                fields={fields}
                allowLeadingZeros
                allowNegative={false}
                allowDecimal={false}
                hideControls
                trimLeadingZeroesOnBlur={false}
                valueIsNumericString
              />
            </div>
            <div className="p-5">
              <InputText
                fields={fields}
                {...companyFormLabel["email"]}
                my="sm"
              />
              <InputText
                fields={fields}
                {...companyFormLabel["registered_number"]}
                my="sm"
              />
              <InputDate
                {...companyFormLabel["registered_date"]}
                fields={fields}
              />
              <InputRadio
                name={fields.active.name}
                label="Status"
                my="sm"
                value={active.value}
                onChange={active.change}
                onFocus={active.focus}
                onBlur={active.blur}
                defaultValue={active.value}
                withAsterisk
                fields={fields}
              >
                <Radio key="y" size="xs" checked value="y" label="Aktif" />
                <Radio key="n" size="xs" value="n" label="Non-aktif" />
              </InputRadio>
            </div>
          </div>
          <div className="grid grid-cols-1 px-4">
            <Tabs defaultValue="address">
              <Tabs.List>
                <Tabs.Tab value="address" leftSection={<IconMap size={12} />}>
                  Alamat
                </Tabs.Tab>
                <Tabs.Tab
                  value="contact"
                  leftSection={<IconPhoneCall size={12} />}
                >
                  Kontak
                </Tabs.Tab>
                <Tabs.Tab
                  value="contact_person"
                  leftSection={<IconUser size={12} />}
                >
                  Kontak Person
                </Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="address">
                <CompanyAddressTabPanel />
              </Tabs.Panel>

              <Tabs.Panel value="contact">
                <ContactPage />
              </Tabs.Panel>

              <Tabs.Panel value="contact_person">
                <ContactPersonPage />
              </Tabs.Panel>
            </Tabs>
          </div>
        </AppCardForm>
      </FormProvider>
    </>
  );
};

export default CompanyForm;
