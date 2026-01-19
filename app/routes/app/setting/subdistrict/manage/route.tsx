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
import { subdistrictFormLabel, schema } from "./constant";
import { loaderHandler } from "./loader";

export const action = ({ request }: ActionFunctionArgs) => {
  return actionHandler(request);
};

export const loader = ({ request }: LoaderFunctionArgs) => {
  return loaderHandler(request);
};

const SubdistrictForm = () => {
  const lastResult = useActionData<typeof action>();
  const data = useLoaderData<typeof loader>();

  const subdistrict = data.data;

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
      id: subdistrict?.id,
      code: subdistrict?.code,
      name: subdistrict?.name,
      district: subdistrict?.district_id?.toString() ?? undefined,
      city: subdistrict?.district?.city?.name.toString() ?? undefined,
      postal_code: subdistrict?.postal_code,
      province:
        subdistrict?.district?.city?.province?.name?.toString() ?? undefined,
      country:
        subdistrict?.district?.city?.province?.country?.name?.toString() ??
        undefined,
      active: subdistrict ? (subdistrict.active ? "y" : "n") : "y",
    },
  });

  const active = useInputControl(fields.active);
  const district = useInputControl(fields.district);

  return (
    <>
      <Form
        method="POST"
        {...getFormProps(form)}
        action="/app/setting/subdistrict/manage"
      >
        <AppCardForm
          isForm={true}
          title="Form Master Kelurahan / Desa"
          actionButtons={
            <div className="inline-flex gap-3">
              <Button
                type="button"
                size="xs"
                leftSection={<Icon icon="tabler:x" className="h-5 w-5" />}
                variant="default"
                onClick={() => navigate("/app/setting/subdistrict")}
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
              <InputText fields={fields} {...subdistrictFormLabel["code"]} />
              <InputText fields={fields} {...subdistrictFormLabel["name"]} />
              <InputSelect
                {...subdistrictFormLabel["district"]}
                remountKey={district.value}
                fields={fields}
                searchable={true}
                clearable
                value={district.value}
                onChange={(value, opt) => {
                  const selected = opt as typeof opt & {
                    originalData?: {
                      city?: {
                        name?: string;
                        province?: {
                          name?: string;
                          country?: {
                            name?: string;
                          };
                        };
                      };
                    };
                  };

                  form.reset({ name: fields.city.name });
                  form.reset({ name: fields.province.name });
                  form.reset({ name: fields.country.name });
                  if (value !== district.value) {
                    district.change(value ?? undefined);
                    form.update({
                      name: fields.city.name,
                      value: selected?.originalData?.city?.name,
                    });
                    form.update({
                      name: fields.province.name,
                      value: selected?.originalData?.city?.province?.name,
                    });
                    form.update({
                      name: fields.country.name,
                      value:
                        selected?.originalData?.city?.province?.country?.name,
                    });
                  }
                }}
                onFocus={district.focus}
                selectFirstOptionOnChange={true}
                onBlur={() => {
                  return district.blur;
                }}
                dataFetch={{
                  urlPath: "api/district",
                  keys: { label: "name", value: "id" },
                  dataKeys: "data",
                }}
                allowDeselect
                skipLimit={district.value ? true : false}
              />
              <InputText {...subdistrictFormLabel["city"]} fields={fields} />
            </div>
            <div className="p-5">
              <InputText
                {...subdistrictFormLabel["province"]}
                fields={fields}
              />
              <InputText {...subdistrictFormLabel["country"]} fields={fields} />
              <InputText
                fields={fields}
                {...subdistrictFormLabel["postal_code"]}
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

export default SubdistrictForm;
