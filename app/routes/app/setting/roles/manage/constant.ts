import { z } from "zod";

import { MenuItem } from "./column";

export const roleFormLabel = {
  code: {
    name: "code",
    label: "Kode Roles",
    placeholder: "Kode Roles",
    withAsterisk: true,
  },
  name: {
    name: "name",
    label: "Nama",
    placeholder: "Nama",
    withAsterisk: true,
  },
  module: {
    name: "module",
    label: "Modul",
    placeholder: "Modul",
    withAsterisk: true,
  },
  active: {
    name: "active",
    label: "Status",
    withAsterisk: true,
  },
  privilege: {
    name: "privilege",
    label: "Perizinan",
    withAsterisk: true,
  },
  all_privilege: {
    label: "All Privilege",
  },
  all_create: {
    label: "All Create",
  },
  all_read: {
    label: "All Read",
  },
  all_update: {
    label: "All Update",
  },
  all_delete: {
    label: "All Delete",
  },
};

export const schema = z.object({
  id: z.number().optional(),
  code: z.string({ required_error: "Kode roles harus diisi" }),
  name: z.string({ required_error: "Nama harus diisi" }),
  module: z.array(z.string({ required_error: "Modul harus dipilih" })),
  active: z.string({ required_error: "Input tidak valid" }),
  privilege_options: z
    .array(z.enum(["all_create", "all_read", "all_update", "all_delete"]))
    .optional(),
  permissions: z.array(
    z.object({
      menu_id: z.coerce.number(),
      title: z.string(),
      parent_id: z.coerce.number().optional(),
      group: z.string().optional().nullable(),
      create: z.coerce.boolean(),
      read: z.coerce.boolean(),
      update: z.coerce.boolean(),
      delete: z.coerce.boolean(),
    }),
  ),
});

type PageInfo = {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type TableResponse = {
  data: MenuItem[];
  totalCount: number;
  pageInfo: PageInfo;
};

export type TableErrorResponse = {
  data: never[];
  message: string;
};

export type TableApiResponse = TableResponse | TableErrorResponse;

export type RolesFormType = z.infer<typeof schema>;
export type OriginType =
  | "allPrivilege"
  | "privilege"
  | "menuPermissions"
  | "allPrivilegesAndPrivilege"
  | "allPrivilegesAndMenuPermissions"
  | "privilegeAndMenuPermissions"
  | "menuPermissionsAndPrivilege"
  | "privilegeAndAllPrivileges"
  | null;
