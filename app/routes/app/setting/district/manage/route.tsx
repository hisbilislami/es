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
import { districtFormLabel, schema } from "./constant";
import { loaderHandler } from "./loader";

export const action = ({ request }: ActionFunctionArgs) => {
  return actionHandler(request);
};

export const loader = ({ request }: LoaderFunctionArgs) => {
  return loaderHandler(request);
};

const DistrictForm = () => {
  const lastResult = useActionData<typeof action>();
  const data = useLoaderData<typeof loader>();

  const district = data.data;

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
      id: district?.id,
      code: district?.code,
      name: district?.name,
      city: district?.city_id?.toString() ?? undefined,
      province: district?.city.name?.toString() ?? undefined,
      country: district?.city.province.name?.toString() ?? undefined,
      active: district ? (district.active ? "y" : "n") : "y",
    },
  });

  const active = useInputControl(fields.active);
  const city = useInputControl(fields.city);

  return (
    <>
      <Form
        method="POST"
        {...getFormProps(form)}
        action="/app/setting/district/manage"
      >
        <AppCardForm
          isForm={true}
          title="Form Master Kecamatan"
          actionButtons={
            <div className="inline-flex gap-3">
              <Button
                type="button"
                size="xs"
                leftSection={<Icon icon="tabler:x" className="h-5 w-5" />}
                variant="default"
                onClick={() => navigate("/app/setting/district")}
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
              <InputText fields={fields} {...districtFormLabel["code"]} />
              <InputText fields={fields} {...districtFormLabel["name"]} />
              <InputSelect
                {...districtFormLabel["city"]}
                remountKey={city.value}
                fields={fields}
                searchable={true}
                value={city.value}
                onChange={(value, opt) => {
                  const selected = opt as typeof opt & {
                    originalData?: {
                      province?: {
                        id?: string;
                        name?: string;
                        country?: { id?: string; name?: string };
                      };
                    };
                  };

                  form.reset({ name: fields.province.name });
                  form.reset({ name: fields.country.name });

                  if (value !== city.value) {
                    city.change(value ?? undefined);

                    const province = selected?.originalData?.province?.name;
                    const country =
                      selected?.originalData?.province?.country?.name;

                    form.update({
                      name: fields.province.name,
                      value: province,
                    });

                    form.update({
                      name: fields.country.name,
                      value: country,
                    });
                  }
                }}
                onFocus={city.focus}
                selectFirstOptionOnChange={true}
                onBlur={() => {
                  return city.blur;
                }}
                dataFetch={{
                  urlPath: "api/city",
                  keys: { label: "name", value: "id" },
                  dataKeys: "data",
                }}
                allowDeselect
                clearable
                skipLimit={city.value ? true : false}
              />
            </div>
            <div className="p-5">
              <InputText {...districtFormLabel["province"]} fields={fields} />
              <InputText {...districtFormLabel["country"]} fields={fields} />

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

export default DistrictForm;
