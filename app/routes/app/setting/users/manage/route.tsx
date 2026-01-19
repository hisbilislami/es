import { getFormProps, useForm, useInputControl } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Button } from "@mantine/core";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigate,
  useNavigation,
} from "@remix-run/react";

import AppCardForm from "~/components/card/app-card-form";
import InputNumber from "~/components/form/input-number";
import InputSelect from "~/components/form/input-select";
import InputText from "~/components/form/input-text";

import { actionHandler } from "./action";
import { userFormLabel, schema } from "./constant";
import { loaderHandler } from "./loader";

export const action = ({ request }: ActionFunctionArgs) => {
  return actionHandler(request);
};

export const loader = ({ request }: LoaderFunctionArgs) => {
  return loaderHandler(request);
};

const UserForm = () => {
  const lastResult = useActionData<typeof action>();
  const data = useLoaderData<typeof loader>();

  const user = data.data;

  const navigation = useNavigation();
  const navigate = useNavigate();

  const [form, fields] = useForm({
    lastResult,
    constraint: getZodConstraint(schema(null)),
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema: (intent) => schema(intent),
      });
    },
    defaultValue: {
      id: user?.id,
      person_id: user?.person_id,
      username: user?.username,
      name: user?.person?.name,
      email: user?.person?.email,
      phone_number: user?.person?.phone_number,
      nik: user?.person?.person_identity[0]?.number,
      role: user?.role_id?.toString() ?? undefined,
    },
  });

  const role = useInputControl(fields.role);

  return (
    <>
      <Form
        method="POST"
        {...getFormProps(form)}
        action="/app/setting/users/manage"
      >
        <AppCardForm
          isForm={true}
          title="Form Master User"
          actionButtons={
            <div className="inline-flex gap-3">
              <Button
                type="button"
                size="xs"
                leftSection={<Icon icon="tabler:x" className="h-5 w-5" />}
                variant="default"
                onClick={() => navigate("/app/setting/users")}
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
              <InputNumber fields={fields} {...userFormLabel["nik"]} my="sm" />
              <InputText
                fields={fields}
                {...userFormLabel["username"]}
                my="sm"
              />
              <InputText fields={fields} {...userFormLabel["name"]} my="sm" />
            </div>
            <div className="p-5">
              <InputText fields={fields} {...userFormLabel["email"]} my="sm" />
              <InputNumber
                fields={fields}
                {...userFormLabel["phone_number"]}
                my="sm"
              />
              <InputSelect
                {...userFormLabel["role"]}
                remountKey={role.value}
                fields={fields}
                value={role.value}
                onChange={(value) => {
                  role.change(value ?? undefined);
                }}
                onFocus={role.focus}
                selectFirstOptionOnChange={true}
                className="my-3"
                onBlur={role.blur}
                dataFetch={{
                  urlPath: "api/roles",
                  keys: { label: "name", value: "id" },
                  dataKeys: "data",
                }}
                allowDeselect
                skipLimit={role.value ? true : false}
              />
            </div>
          </div>
        </AppCardForm>
      </Form>
    </>
  );
};

export default UserForm;
