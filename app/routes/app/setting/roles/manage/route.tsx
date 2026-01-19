import { getFormProps, useForm, useInputControl } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { Icon } from "@iconify/react/dist/iconify.js";
import {
  Button,
  Checkbox,
  Grid,
  Group,
  Radio,
  Space,
  Text,
} from "@mantine/core";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  Form,
  useActionData,
  useFetcher,
  useLoaderData,
  useNavigate,
  useNavigation,
  useSearchParams,
} from "@remix-run/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";

import AppCardForm from "~/components/card/app-card-form";
import InputMultiSelect from "~/components/form/input-multi-select";
import InputRadio from "~/components/form/input-radio";
import InputText from "~/components/form/input-text";
import { DataTable, useDataTable } from "~/components/table";
import { useDialog } from "~/context/DialogContext";
import { loader as loaderMenuAccess } from "~/routes/api/menu-access/route";

import actionHandler from "./action";
import { getColumns, MenuItem } from "./column";
import {
  OriginType,
  roleFormLabel,
  schema,
  TableApiResponse,
  TableResponse,
} from "./constant";
import { loaderHandler } from "./loader";

export async function action({ request }: ActionFunctionArgs) {
  return actionHandler(request);
}

export async function loader({ request }: LoaderFunctionArgs) {
  return loaderHandler(request);
}

const origin: Record<string, OriginType> = {
  none: null,
  all_privilege: "allPrivilege",
  privilege: "privilege",
  menu_permissions: "menuPermissions",
  all_privileges_and_privilege: "allPrivilegesAndPrivilege",
  all_privileges_and_menu_permissions: "allPrivilegesAndMenuPermissions",
  privilege_and_menu_permissions: "privilegeAndMenuPermissions",
  menu_permissions_and_privilege: "menuPermissionsAndPrivilege",
  privilege_and_all_privileges: "privilegeAndAllPrivileges",
};

const RolesForm = () => {
  const lastResult = useActionData<typeof action>();
  const data = useLoaderData<typeof loader>();
  const role = data.data;

  const lastChangedBy = useRef<OriginType>(origin.none);

  const navigate = useNavigate();
  const navigation = useNavigation();

  const [menus, setMenus] = useState<TableResponse | undefined>(undefined);
  const [menuPermissions, setMenuPermissions] = useState<MenuItem[]>([]);
  const columns = getColumns(
    menuPermissions,
    setMenuPermissions,
    lastChangedBy,
  );
  const { showDialog } = useDialog();

  const [searchParams] = useSearchParams();
  const page = useMemo(() => searchParams.get("page") || 0, [searchParams]);
  const size = useMemo(() => searchParams.get("size") || 10, [searchParams]);

  const [form, fields] = useForm({
    id: "roles-form",
    lastResult,
    constraint: getZodConstraint(schema),
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
    },
    defaultValue: {
      id: role?.role_id,
      code: lastResult?.fields?.code ?? role?.role_code,
      name: lastResult?.fields?.name ?? role?.role_name,
      active:
        lastResult?.fields?.active ??
        (role ? (role?.role_active ? "y" : "n") : "y"),
      module: lastResult?.fields?.module ?? role?.modules,
      permissions: role?.permissions || [],
    },
  });

  const allCreateCb = useRef<HTMLInputElement>(null);
  const allReadCb = useRef<HTMLInputElement>(null);
  const allUpdateCb = useRef<HTMLInputElement>(null);
  const allDeleteCb = useRef<HTMLInputElement>(null);

  const active = useInputControl(fields.active);
  const module = useInputControl(fields.module);
  const privilege = useInputControl(fields.privilege_options);

  const checkedCbFromEdit = useRef<string[]>([]);

  const [allPrivilege, setAllPrivilege] = useState<boolean>(false);
  const [indeterminate, setIndeterminate] = useState({
    create: false,
    read: false,
    update: false,
    delete: false,
  });

  const fetcherModule = useFetcher<typeof loaderMenuAccess>();

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const urlParams = new URLSearchParams();

        if (
          module.value &&
          Array.isArray(module.value) &&
          module.value.length > 0
        ) {
          const menuIds = module.value.join(",");
          urlParams.set("menu_ids", menuIds);
        }

        const queryString = urlParams.toString();
        const apiUrl = `/api/menu-access${queryString ? `?${queryString}` : ""}`;

        fetcherModule.load(apiUrl);
      } catch (error) {
        if (error instanceof Error) {
          showDialog({
            title: "Fetching Error",
            description: error.message,
            type: "error",
          });
        }
      }
    };

    if (Array.isArray(module.value)) {
      fetchMenus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [module.value]);

  useEffect(() => {
    if (fetcherModule.state === "idle" && fetcherModule.data) {
      const responseData = fetcherModule.data as TableApiResponse;

      if ("totalCount" in responseData && "pageInfo" in responseData) {
        setMenus(responseData);
      } else if ("message" in responseData) {
        setMenus(undefined);
      }
    }
  }, [fetcherModule.state, fetcherModule.data]);

  const { table } = useDataTable({
    columns: columns,
    data: menuPermissions,
    count: menus?.totalCount || 0,
    isLoading: navigation.state !== "idle",
    paginationState: {
      pageIndex: Number(page),
      pageSize: Number(size),
    },
  });

  // NOTE: privilege useEffect
  useEffect(() => {
    const current: string[] = privilege.value
      ? (privilege.value as string[])
      : [];
    const previous = checkedCbFromEdit.current;

    // NOTE: case b-1
    if (lastChangedBy.current === origin.privilege) {
      if (!Array.isArray(privilege.value)) return;

      const isAllCreateChecked = privilege.value.includes("all_create");
      const isAllReadChecked = privilege.value.includes("all_read");
      const isAllUpdateChecked = privilege.value.includes("all_update");
      const isAllDeleteChecked = privilege.value.includes("all_delete");

      lastChangedBy.current = origin.all_privileges_and_menu_permissions;

      if (
        !isAllCreateChecked ||
        !isAllReadChecked ||
        !isAllUpdateChecked ||
        !isAllDeleteChecked
      ) {
        setAllPrivilege(false);
      }

      if (
        isAllCreateChecked &&
        isAllReadChecked &&
        isAllUpdateChecked &&
        isAllDeleteChecked
      ) {
        setAllPrivilege(true);
      }

      const permissionKeys = ["create", "read", "update", "delete"] as const;
      // Find removed
      const removed = previous.filter((val) => !current.includes(val));

      if (privilege.value.length > 0) {
        const lastItem = privilege.value[privilege.value.length - 1];
        const cleanKey = lastItem.replace(/^all_/, "");

        setIndeterminate((prev) => ({
          ...prev,
          [cleanKey]: false,
        }));

        setMenuPermissions((prev) =>
          prev.map((d) => {
            const updated = { ...d };
            permissionKeys.forEach((key) => {
              if (key === cleanKey) {
                // Only update if not indeterminate
                updated[key] =
                  key === "create"
                    ? isAllCreateChecked
                    : key === "read"
                      ? isAllReadChecked
                      : key === "update"
                        ? isAllUpdateChecked
                        : isAllDeleteChecked;
              } else {
                // For other keys, set to false if not indeterminate
                if (!privilege.value?.includes(`all_${key}`)) {
                  if (!indeterminate[key]) {
                    updated[key] = false;
                  }
                }
              }
            });
            return updated;
          }),
        );
      } else {
        let cbUncheckedValue: string = "";
        if (removed.length > 0) {
          // Checkbox(es) unchecked
          removed.forEach((val) => {
            cbUncheckedValue = val;
          });
          const cbUncheckedCleanValue = cbUncheckedValue.replace(/^all_/, "");

          setMenuPermissions((prev) =>
            prev.map((d) => ({
              ...d,
              [cbUncheckedCleanValue]: false,
            })),
          );
        }
      }

      // Update ref for next render
      checkedCbFromEdit.current = current;
    }

    // NOTE: case a-2
    if (lastChangedBy.current === origin.all_privileges_and_privilege) {
      if (!Array.isArray(privilege.value)) return;

      const isAllCreateChecked = privilege.value.includes("all_create");
      const isAllReadChecked = privilege.value.includes("all_read");
      const isAllUpdateChecked = privilege.value.includes("all_update");
      const isAllDeleteChecked = privilege.value.includes("all_delete");

      setIndeterminate({
        create: false,
        read: false,
        update: false,
        delete: false,
      });

      lastChangedBy.current = origin.privilege_and_menu_permissions;
      setMenuPermissions((prev) =>
        prev.map((d) => ({
          ...d,
          create: isAllCreateChecked,
          read: isAllReadChecked,
          update: isAllUpdateChecked,
          delete: isAllDeleteChecked,
        })),
      );
    }

    // NOTE: case c-2
    if (lastChangedBy.current === origin.menu_permissions_and_privilege) {
      if (!Array.isArray(privilege.value)) return;

      const isAllCreateChecked = privilege.value.includes("all_create");
      const isAllReadChecked = privilege.value.includes("all_read");
      const isAllUpdateChecked = privilege.value.includes("all_update");
      const isAllDeleteChecked = privilege.value.includes("all_delete");

      lastChangedBy.current = origin.privilege_and_all_privileges;
      if (
        !isAllCreateChecked ||
        !isAllReadChecked ||
        !isAllUpdateChecked ||
        !isAllDeleteChecked
      ) {
        setAllPrivilege(false);
      }

      if (
        isAllCreateChecked &&
        isAllReadChecked &&
        isAllUpdateChecked &&
        isAllDeleteChecked
      ) {
        setAllPrivilege(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [privilege.value]);

  // NOTE: allPrevilege useEffect
  useEffect(() => {
    // NOTE: case a-1
    if (lastChangedBy.current === origin.all_privilege) {
      const allKeys = ["all_create", "all_read", "all_update", "all_delete"];
      const isAllCreateChecked = privilege?.value?.includes("all_create");
      const isAllReadChecked = privilege?.value?.includes("all_read");
      const isAllUpdateChecked = privilege?.value?.includes("all_update");
      const isAllDeleteChecked = privilege?.value?.includes("all_delete");

      const isAllChecked =
        isAllCreateChecked &&
        isAllReadChecked &&
        isAllUpdateChecked &&
        isAllDeleteChecked;

      if (allPrivilege) {
        lastChangedBy.current = origin.all_privileges_and_privilege;
        privilege.change(allKeys);
      } else {
        if (isAllChecked) {
          lastChangedBy.current = origin.all_privileges_and_privilege;
          privilege.change([]);
        }
      }
    }

    // NOTE: case b-3
    if (lastChangedBy.current === origin.all_privileges_and_menu_permissions) {
      lastChangedBy.current = origin.none;
      return;
    }

    // NOTE: case c-3
    if (lastChangedBy.current === origin.privilege_and_all_privileges) {
      lastChangedBy.current = origin.none;
      return;
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allPrivilege]);

  // NOTE: menuPermissions useEffect
  useEffect(() => {
    // NOTE: case c-1
    if (lastChangedBy.current === origin.menu_permissions) {
      if (menuPermissions.length === 0) return;

      let values: string[] = Array.isArray(privilege.value)
        ? privilege.value
        : [];

      const calcIndeterminate = (
        key: "create" | "read" | "update" | "delete",
      ) => {
        const allChecked = menuPermissions.every((item) => item[key]);
        const noneChecked = menuPermissions.every((item) => !item[key]);

        // if ((allChecked && !noneChecked) || (!allChecked && !noneChecked)) {
        if (allChecked && !noneChecked) {
          if (!values.includes(`all_${key}`)) {
            values.push(`all_${key}`);
          }
        } else if (!allChecked && noneChecked) {
          if (values.includes(`all_${key}`)) {
            values = values.filter((v) => v !== `all_${key}`);
          }
        }

        return !allChecked && !noneChecked;
      };

      lastChangedBy.current = origin.menu_permissions_and_privilege;

      setIndeterminate({
        create: calcIndeterminate("create"),
        read: calcIndeterminate("read"),
        update: calcIndeterminate("update"),
        delete: calcIndeterminate("delete"),
      });
      checkedCbFromEdit.current = values;
      privilege.change(values);
    }

    // NOTE: case a-3
    if (lastChangedBy.current === origin.privileges_and_menu_permissions) {
      lastChangedBy.current = origin.none;
      if (menuPermissions.length === 0) return;
    }

    // NOTE: case b-3
    if (lastChangedBy.current === origin.all_privileges_and_menu_permissions) {
      lastChangedBy.current = origin.none;
      if (menuPermissions.length === 0) return;
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menuPermissions]);

  useEffect(() => {
    if (menus?.data) {
      const mp = menus?.data?.map((p) => {
        return {
          title: p.title,
          menu_id: p.menu_id,
          parent_id: p.parent_id,
          group: p.group,
          create: p.create,
          read: p.read,
          update: p.update,
          delete: p.delete,
        };
      });

      lastChangedBy.current = origin.menu_permissions;
      setMenuPermissions(mp);
    }
  }, [menus?.data]);

  return (
    <>
      <Form
        method="post"
        {...getFormProps(form)}
        action="/app/setting/roles/manage"
        id="roles-form"
      >
        <AppCardForm
          isForm={true}
          title="Form Role"
          actionButtons={
            <div className="inline-flex gap-3">
              <Button
                type="button"
                size="xs"
                leftSection={<Icon icon="tabler:x" className="h-5 w-5" />}
                variant="default"
                onClick={() => navigate("/app/setting/roles")}
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
          <div>
            <AppCardForm isForm={true} title="Role" borderTop={true}>
              <Grid
                className="p-5"
                gutter={{ base: 5, xs: "md", md: "xl", xl: 50 }}
              >
                <Grid.Col span={7}>
                  <Grid>
                    <Grid.Col span={6}>
                      <input
                        type="hidden"
                        name={fields.id.name}
                        value={fields.id.value}
                      />
                      <InputText {...roleFormLabel["code"]} fields={fields} />
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <InputText {...roleFormLabel["name"]} fields={fields} />
                    </Grid.Col>
                    <Grid.Col>
                      <InputMultiSelect
                        {...roleFormLabel["module"]}
                        name={fields.module.name}
                        fields={fields}
                        value={module.value as z.infer<typeof schema>["module"]}
                        onChange={(value) => {
                          module.change(value);
                        }}
                        dataFetch={{
                          urlPath: "api/module",
                          keys: { label: "title", value: "id" },
                          dataKeys: "data",
                        }}
                      />
                    </Grid.Col>
                  </Grid>
                </Grid.Col>
                <Grid.Col span={5}>
                  <InputRadio
                    {...roleFormLabel["active"]}
                    value={active.value}
                    onChange={active.change}
                    onFocus={active.focus}
                    onBlur={active.blur}
                    defaultValue={active.value}
                    fields={fields}
                  >
                    <Radio key="y" size="xs" value="y" label="Aktif" />
                    <Radio key="n" size="xs" value="n" label="Non-aktif" />
                  </InputRadio>
                  <Group mt="xs">
                    <Grid className="w-full">
                      <Grid.Col span={4}>
                        <Text size="sm" className="font-medium">
                          Perizinan
                        </Text>
                        <Checkbox
                          className="mt-3"
                          size="xs"
                          checked={allPrivilege}
                          onChange={(e) => {
                            lastChangedBy.current = origin.all_privilege;
                            setAllPrivilege(e.currentTarget.checked);
                          }}
                          label={roleFormLabel["all_privilege"].label}
                        />
                      </Grid.Col>
                      <Grid.Col span={8}>
                        <Checkbox.Group
                          value={
                            privilege.value as z.infer<
                              typeof schema
                            >["privilege_options"]
                          }
                          onChange={(value) => {
                            lastChangedBy.current = origin.privilege;
                            privilege.change(value);
                          }}
                          label=" "
                        >
                          <Group mt="xs">
                            <Grid className="w-full">
                              <Grid.Col span={12}>
                                <Grid
                                  gutter={{
                                    base: 5,
                                    xs: "md",
                                    md: "xl",
                                    xl: 50,
                                  }}
                                >
                                  <Grid.Col span={6}>
                                    <Checkbox
                                      size="xs"
                                      ref={allCreateCb}
                                      value="all_create"
                                      indeterminate={indeterminate.create}
                                      label={roleFormLabel["all_create"].label}
                                    />
                                    <Space h={3} />
                                    <Checkbox
                                      size="xs"
                                      ref={allReadCb}
                                      value="all_read"
                                      indeterminate={indeterminate.read}
                                      label={roleFormLabel["all_read"].label}
                                    />
                                  </Grid.Col>
                                  <Grid.Col span={6}>
                                    <Checkbox
                                      size="xs"
                                      ref={allUpdateCb}
                                      value="all_update"
                                      indeterminate={indeterminate.update}
                                      label={roleFormLabel["all_update"].label}
                                    />
                                    <Space h={3} />
                                    <Checkbox
                                      size="xs"
                                      ref={allDeleteCb}
                                      value="all_delete"
                                      indeterminate={indeterminate.delete}
                                      label={roleFormLabel["all_delete"].label}
                                    />
                                  </Grid.Col>
                                </Grid>
                              </Grid.Col>
                            </Grid>
                          </Group>
                        </Checkbox.Group>
                      </Grid.Col>
                    </Grid>
                  </Group>
                </Grid.Col>
              </Grid>
            </AppCardForm>

            <AppCardForm isForm={false} title="Daftar Menu" borderTop={true}>
              <DataTable
                columns={columns}
                table={table}
                textName="Menu"
                withSearchField={false}
              />
            </AppCardForm>
          </div>
        </AppCardForm>
      </Form>
    </>
  );
};

export default RolesForm;
