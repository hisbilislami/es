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
import InputText from "~/components/form/input-text";

import { actionHandler } from "./action";
import { timezoneFormLabel, schema } from "./constant";
import { loaderHandler } from "./loader";

export const action = ({ request }: ActionFunctionArgs) => {
  return actionHandler(request);
};

export const loader = ({ request }: LoaderFunctionArgs) => {
  return loaderHandler(request);
};

const TimezoneForm = () => {
  const lastResult = useActionData<typeof action>();
  const data = useLoaderData<typeof loader>();

  const timezone = data.data;

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
      id: timezone?.id,
      code: timezone?.code,
      name: timezone?.name,
      offset_sdt: timezone?.offset_sdt,
      offset_dst: timezone?.offset_dst,
      abbrevation_sdt: timezone?.abbrevation_sdt,
      abbrevation_dst: timezone?.abbrevation_dst,
      active: timezone ? (timezone.active ? "y" : "n") : "y",
    },
  });

  const active = useInputControl(fields.active);

  return (
    <>
      <Form
        method="POST"
        {...getFormProps(form)}
        action="/app/setting/timezone/manage"
      >
        <AppCardForm
          isForm={true}
          title="Form Master Negara"
          actionButtons={
            <div className="inline-flex gap-3">
              <Button
                type="button"
                size="xs"
                leftSection={<Icon icon="tabler:x" className="h-5 w-5" />}
                variant="default"
                onClick={() => navigate("/app/setting/timezone")}
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
                {...timezoneFormLabel["code"]}
                my="sm"
              />
              <InputText
                fields={fields}
                {...timezoneFormLabel["name"]}
                my="sm"
              />
              <InputText
                fields={fields}
                {...timezoneFormLabel["offset_sdt"]}
                my="sm"
              />
              <InputText
                fields={fields}
                {...timezoneFormLabel["offset_dst"]}
                my="sm"
              />
            </div>
            <div className="p-5">
              <InputText
                fields={fields}
                {...timezoneFormLabel["abbrevation_sdt"]}
                my="sm"
              />
              <InputText
                fields={fields}
                {...timezoneFormLabel["abbrevation_dst"]}
                max="4"
                my="sm"
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

export default TimezoneForm;
