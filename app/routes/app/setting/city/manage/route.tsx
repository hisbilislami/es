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
import { cityFormLabel, schema } from "./constant";
import { loaderHandler } from "./loader";

export const action = ({ request }: ActionFunctionArgs) => {
  return actionHandler(request);
};

export const loader = ({ request }: LoaderFunctionArgs) => {
  return loaderHandler(request);
};

const CityForm = () => {
  const lastResult = useActionData<typeof action>();
  const data = useLoaderData<typeof loader>();

  const city = data.data;

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
      id: city?.id,
      code: city?.code,
      name: city?.name,
      sni_name: city?.sni_name,
      province: city?.province_id?.toString() ?? undefined,
      country: city?.province?.country?.name?.toString() ?? undefined,
      timezone: city?.timezone_id?.toString() ?? undefined,
      active: city ? (city.active ? "y" : "n") : "y",
    },
  });

  const active = useInputControl(fields.active);
  const province = useInputControl(fields.province);
  const timezone = useInputControl(fields.timezone);

  return (
    <>
      <Form
        method="POST"
        {...getFormProps(form)}
        action="/app/setting/city/manage"
      >
        <AppCardForm
          isForm={true}
          title="Form Master Kota / Kabupaten"
          actionButtons={
            <div className="inline-flex gap-3">
              <Button
                type="button"
                size="xs"
                leftSection={<Icon icon="tabler:x" className="h-5 w-5" />}
                variant="default"
                onClick={() => navigate("/app/setting/city")}
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
            <div className="p-5 flex flex-col justify-start">
              <input
                type="hidden"
                name={fields.id.name}
                value={fields.id.value}
              />
              <InputText
                fields={fields}
                {...cityFormLabel["code"]}
                className="my-1"
              />
              <InputText
                fields={fields}
                {...cityFormLabel["name"]}
                className="my-1"
              />
              <InputText
                fields={fields}
                {...cityFormLabel["sni_name"]}
                className="my-1"
              />
            </div>
            <div className="p-5 flex flex-col justify-start">
              <InputSelect
                {...cityFormLabel["province"]}
                remountKey={province.value}
                fields={fields}
                searchable={true}
                clearable
                value={province.value}
                onChange={(value, opt) => {
                  const selected = opt as typeof opt & {
                    originalData?: {
                      country?: { id?: string; name?: string };
                    };
                  };

                  form.reset({ name: fields.country.name });

                  if (value !== province.value) {
                    province.change(value ?? undefined);

                    form.update({
                      name: fields.country.name,
                      value: selected?.originalData?.country?.name ?? "",
                    });
                  }
                }}
                onFocus={province.focus}
                selectFirstOptionOnChange={true}
                onBlur={() => {
                  return province.blur;
                }}
                dataFetch={{
                  urlPath: "api/province",
                  keys: { label: "name", value: "id" },
                  dataKeys: "data",
                }}
                allowDeselect
                className="my-1"
                skipLimit={province.value ? true : false}
              />
              <InputText {...cityFormLabel["country"]} fields={fields} />
              <InputSelect
                {...cityFormLabel["timezone"]}
                remountKey={timezone.value}
                fields={fields}
                searchable={true}
                value={timezone.value}
                onChange={(value) => {
                  timezone.change(value ?? undefined);
                }}
                onFocus={timezone.focus}
                selectFirstOptionOnChange={true}
                onBlur={timezone.blur}
                dataFetch={{
                  urlPath: "api/timezone",
                  keys: { label: "name", value: "id" },
                  dataKeys: "data",
                }}
                allowDeselect
                className="my-1"
                skipLimit={timezone.value ? true : false}
              />
              <InputRadio
                name={fields.active.name}
                label="Status"
                className="my-1 mt-2"
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

export default CityForm;
