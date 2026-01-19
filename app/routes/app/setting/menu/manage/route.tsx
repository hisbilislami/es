import { getFormProps, useForm, useInputControl } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Button, Popover, Radio, Text } from "@mantine/core";
import { ActionFunctionArgs } from "@remix-run/node";
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

import actionHandler from "./action";
import { menuFormLabel, schema } from "./constant";
import { loaderHandler } from "./loader";

export async function action({ request }: ActionFunctionArgs) {
  return actionHandler(request);
}

export async function loader({ request }: ActionFunctionArgs) {
  return loaderHandler(request);
}

const MenuForm = () => {
  const lastResult = useActionData<typeof action>();
  const data = useLoaderData<typeof loader>();
  const menu = data.data;
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
      id: menu?.id,
      type:
        lastResult?.fields?.type ??
        (menu ? (menu?.parent_id ? "menu" : "modul") : "menu"),
      code: lastResult?.fields?.code ?? menu?.code,
      title: lastResult?.fields?.title ?? menu?.title,
      module: lastResult?.fields?.module ?? menu?.parent_id?.toString(),
      link: lastResult?.fields?.link ?? menu?.link,
      position: lastResult?.fields?.position ?? menu?.position,
      group: lastResult?.fields?.group ?? menu?.group,
      group_position:
        lastResult?.fields?.group_position ?? menu?.group_position,
      icon: lastResult?.fields?.icon ?? menu?.icon,
      category: lastResult?.fields?.category ?? menu?.category ?? "inside",
      active:
        lastResult?.fields?.active ?? (menu ? (menu?.active ? "y" : "n") : "y"),
    },
  });

  const type = useInputControl(fields.type);
  const active = useInputControl(fields.active);
  const module = useInputControl(fields.module);
  const category = useInputControl(fields.category);

  return (
    <>
      <Form
        method="POST"
        {...getFormProps(form)}
        encType="multipart/form-data"
        action="/app/setting/menu/manage"
      >
        <AppCardForm
          isForm={true}
          title="Form Init Menu"
          actionButtons={
            <div className="inline-flex gap-3">
              <Button
                type="button"
                size="xs"
                leftSection={<Icon icon="tabler:x" className="h-5 w-5" />}
                variant="default"
                onClick={() => navigate("/app/setting/menu")}
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
              <InputText {...menuFormLabel["code"]} fields={fields} />
              <InputRadio
                name={fields.type.name}
                label="Tipe Menu"
                value={type.value}
                onChange={type.change}
                onFocus={type.focus}
                onBlur={type.blur}
                my="sm"
                defaultValue={type.value}
                withAsterisk
                fields={fields}
              >
                <Radio key="menu" size="xs" value="menu" label="Menu" />
                <Radio key="modul" size="xs" value="modul" label="Modul" />
              </InputRadio>
              <InputText {...menuFormLabel["title"]} fields={fields} />

              {type.value === "menu" && (
                <InputSelect
                  {...menuFormLabel["module"]}
                  fields={fields}
                  value={module.value}
                  onChange={(value) => module.change(value ?? undefined)}
                  onFocus={module.focus}
                  onBlur={module.blur}
                  dataFetch={{
                    urlPath: "api/module",
                    keys: { label: "title", value: "id" },
                    dataKeys: "data",
                  }}
                />
              )}
              <InputText {...menuFormLabel["position"]} fields={fields} />
              {type.value === "menu" && (
                <InputText {...menuFormLabel["group"]} fields={fields} />
              )}
            </div>
            <div className="p-5">
              {type.value === "menu" && (
                <InputText
                  {...menuFormLabel["group_position"]}
                  fields={fields}
                />
              )}
              {type.value === "menu" && (
                <InputText {...menuFormLabel["link"]} fields={fields} />
              )}
              <Popover
                width={200}
                clickOutsideEvents={["mouseup", "touchend"]}
                position="top-end"
                withArrow
                shadow="md"
              >
                <InputText
                  {...menuFormLabel["icon"]}
                  fields={fields}
                  rightSection={
                    <Popover.Target>
                      <Icon
                        icon="tabler:question-mark"
                        className="text-tm-blue-600 rounded-full border border-tm-blue-600"
                      />
                    </Popover.Target>
                  }
                />
                <Popover.Dropdown>
                  <Text size="xs">
                    Untuk menggunakan icon, silakan explore dan copy-paste nama
                    icon dari pustaka{" "}
                    <a
                      href="https://icon-sets.iconify.design/tabler/"
                      target="_blank"
                      rel="noreferrer"
                      className="underline text-tm-blue-600"
                    >
                      iconify
                    </a>{" "}
                    berikut.
                  </Text>
                </Popover.Dropdown>
              </Popover>
              {type.value === "menu" && (
                <InputRadio
                  name={fields.category.name}
                  label="Kategori"
                  value={category.value}
                  onChange={category.change}
                  onFocus={category.focus}
                  onBlur={category.blur}
                  defaultValue={category.value}
                  my="sm"
                  withAsterisk
                  fields={fields}
                >
                  <Radio key="inside" size="xs" value="inside" label="Inside" />
                  <Radio
                    key="outside"
                    size="xs"
                    value="outside"
                    label="Outside"
                  />
                </InputRadio>
              )}
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

export default MenuForm;
