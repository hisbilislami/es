import { z } from "zod";

export const menuFormLabel = {
  code: {
    name: "code",
    label: "Kode Menu",
    placeholder: "Kode Menu",
    withAsterisk: true,
  },
  type: {
    name: "type",
    label: "Tipe Menu",
    withAsterisk: true,
  },
  title: {
    name: "title",
    label: "Judul Menu",
    placeholder: "Judul Menu",
    withAsterisk: true,
  },
  module: {
    name: "module",
    label: "Modul",
    withAsterisk: true,
  },
  position: {
    name: "position",
    label: "Posisi",
    placeholder: "Posisi",
    withAsterisk: true,
  },
  group: {
    name: "group",
    label: "Grup",
    placeholder: "Grup",
    withAsterisk: false,
  },
  group_position: {
    name: "group_position",
    label: "Posisi Grup",
    placeholder: "Posisi Grup",
    withAsterisk: false,
  },
  link: {
    name: "link",
    label: "Link",
    placeholder: "Link",
    withAsterisk: true,
  },
  icon: {
    name: "icon",
    label: "Icon",
    placeholder: "Nama Icon",
  },
  category: {
    name: "category",
    label: "Category",
    withAsterisk: true,
  },
  active: {
    name: "active",
    label: "Status",
    withAsterisk: true,
  },
};

export const schema = z
  .object({
    id: z.number().optional(),
    code: z.string({ required_error: "Kode menu harus diisi" }),
    type: z.union([z.literal("menu"), z.literal("modul")]).optional(),
    title: z.string({ required_error: "Judul menu harus diisi" }),
    module: z.number().optional(),
    link: z.string().optional(),
    position: z.number({ required_error: "Posisi menu harus diisi" }),
    group: z.string().optional().nullable(),
    group_position: z.string().optional().nullable(),
    category: z.union([z.literal("inside"), z.literal("outside")]).optional(),
    icon: z.string().optional(),
    active: z.string({ required_error: "Input tidak valid" }),
  })
  .superRefine((data, ctx) => {
    if (data.type === "menu") {
      if (!data.module) {
        ctx.addIssue({
          path: ["module"],
          message: "Modul menu harus dipilih",
          code: z.ZodIssueCode.custom,
        });
      }
      // if (!data.group) {
      //   ctx.addIssue({
      //     path: ["group"],
      //     message: "Grup harus diisi",
      //     code: z.ZodIssueCode.custom,
      //   });
      // }
      // if (!data.group_position) {
      //   ctx.addIssue({
      //     path: ["group_position"],
      //     message: "Posisi grup harus diisi",
      //     code: z.ZodIssueCode.custom,
      //   });
      // }
      if (!data.link) {
        ctx.addIssue({
          path: ["link"],
          message: "Link harus diisi",
          code: z.ZodIssueCode.custom,
        });
      }
      if (!data.category) {
        ctx.addIssue({
          path: ["category"],
          message: "Category harus diisi",
          code: z.ZodIssueCode.custom,
        });
      }
    }
  });
