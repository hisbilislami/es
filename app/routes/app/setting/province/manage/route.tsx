import { getFormProps, useForm, useInputControl } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Button, Radio } from "@mantine/core";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigate,
  useNavigation,
} from "@remix-run/react";

import AppCardForm from "~/components/card/app-card-form";
import InputRadio from "~/components/form/input-radio";
import InputSelect from "~/components/form/input-select";
import InputText from "~/components/form/input-text";

import { actionHandler } from "./action";
import { provinceFormLabel, schema } from "./constant";
import { loaderHandler } from "./loader";

export const action = ({ request }: ActionFunctionArgs) => {
  return actionHandler(request);
};

export const loader = ({ request }: LoaderFunctionArgs) => {
  return loaderHandler(request);
};

const ProvinceForm = () => {
  const lastResult = useActionData<typeof action>();
  const data = useLoaderData<typeof loader>();

  const province = data.data;

  const navigation = useNavigation();
  const navigate = useNavigate();

  const [form, fields] = useForm({
    lastResult,
    constraint: getZodConstraint(schema),
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
    },
    defaultValue: {
      id: province?.id,
      code: province?.code,
      name: province?.name,
      sni_name: province?.sni_name,
      country: province?.country_id?.toString() ?? undefined,
      active: province ? (province.active ? "y" : "n") : "y",
    },
  });

  const active = useInputControl(fields.active);
  const country = useInputControl(fields.country);

  return (
    <>
      <Form
        method="POST"
        {...getFormProps(form)}
        action="/app/setting/province/manage"
      >
        <AppCardForm
          isForm={true}
          title="Form Master Provinsi"
          actionButtons={
            <div className="inline-flex gap-3">
              <Button
                type="button"
                size="xs"
                leftSection={<Icon icon="tabler:x" className="h-5 w-5" />}
                variant="default"
                onClick={() => navigate("/app/setting/province")}
                loading={navigation.state !== "idle"}
              >
                Batal
              </Button>
              <Button
                type="submit"
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
                type="hidden"
                name={fields.id.name}
                value={fields.id.value}
              />
              <InputText
                fields={fields}
                {...provinceFormLabel["code"]}
                my="sm"
              />
              <InputText
                fields={fields}
                {...provinceFormLabel["name"]}
                my="sm"
              />
              <InputText
                fields={fields}
                {...provinceFormLabel["sni_name"]}
                my="sm"
              />
            </div>
            <div className="p-5">
              <InputSelect
                {...provinceFormLabel["country"]}
                remountKey={country.value}
                fields={fields}
                value={country.value}
                onChange={(value) => {
                  country.change(value ?? undefined);
                }}
                onFocus={country.focus}
                selectFirstOptionOnChange={true}
                className="my-3"
                onBlur={country.blur}
                dataFetch={{
                  urlPath: "api/country",
                  keys: { label: "name", value: "id" },
                  dataKeys: "data",
                }}
                allowDeselect
                skipLimit={country.value ? true : false}
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
        </AppCardForm>
      </Form>
    </>
  );
};

export default ProvinceForm;
