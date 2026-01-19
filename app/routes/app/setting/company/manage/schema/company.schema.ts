import { Intent } from "@conform-to/react";
import { conformZodMessage } from "@conform-to/zod";
import { z } from "zod";

import { BillingAddressSchema, ShippingAddressSchema } from "./address.schema";
import { ContactPersonSchema } from "./contact-person.schema";
import { ContactSchema } from "./contact.schema";

export const companyFormLabel = {
  code: {
    name: "code",
    label: "Kode",
    placeholder: "Kode",
    withAsterisk: true,
  },
  name: {
    name: "name",
    label: "Nama",
    placeholder: "Name",
    withAsterisk: true,
  },
  display_name: {
    name: "display_name",
    label: "Ditampilkan",
    placeholder: "Ditampilkan",
    withAsterisk: true,
  },
  phone_number: {
    name: "phone_number",
    label: "No. Telp",
    placeholder: "+62 xxxxxx",
    withAsterisk: false,
  },
  email: {
    name: "email",
    label: "Email",
    placeholder: "Email",
    withAsterisk: false,
  },
  registered_number: {
    name: "registered_number",
    label: "Nomor Pendaftaran",
    placeholder: "Nomor Terdaftar",
    withAsterisk: false,
  },
  registered_date: {
    name: "registered_date",
    label: "Tanggal Terdaftar",
    placeholder: "Tanggal Terdaftar",
    withAsterisk: false,
  },
  active: {
    name: "active",
    label: "Status",
    placeholder: "Status",
    withAsterisk: true,
  },
  billing_address: {
    attention: {
      name: "attention",
      label: "Atensi",
      placeholder: "Atensi",
      withAsterisk: true,
    },
    address: {
      name: "address",
      label: "Alamat",
      placeholder: "Alamat",
      withAsterisk: true,
    },
    country: {
      name: "country",
      label: "Negara",
      placeholder: "Negara",
      withAsterisk: true,
    },
    province: {
      name: "province",
      label: "Provinsi",
      placeholder: "Provinsi",
      withAsterisk: true,
    },
    city: {
      name: "city",
      label: "Kota",
      placeholder: "Kota",
      withAsterisk: true,
    },
    district: {
      name: "district",
      label: "Kecamatan",
      placeholder: "Kecamatan",
      withAsterisk: true,
    },
    subdistrict: {
      name: "subdistrict",
      label: "Desa / Kelurahan",
      placeholder: "Desa / Kelurahan",
      withAsterisk: true,
    },
  },
  shipping_address: {
    attention: {
      name: "attention",
      label: "Atensi",
      placeholder: "Atensi",
      withAsterisk: true,
    },
    address: {
      name: "address",
      label: "Alamat",
      placeholder: "Alamat",
      withAsterisk: true,
    },
    country: {
      name: "country",
      label: "Negara",
      placeholder: "Negara",
      withAsterisk: true,
    },
    province: {
      name: "province",
      label: "Provinsi",
      placeholder: "Provinsi",
      withAsterisk: true,
    },
    city: {
      name: "city",
      label: "Kota",
      placeholder: "Kota",
      withAsterisk: true,
    },
    district: {
      name: "district",
      label: "Kecamatan",
      placeholder: "Kecamatan",
      withAsterisk: true,
    },
    subdistrict: {
      name: "subdistrict",
      label: "Desa / Kelurahan",
      placeholder: "Desa / Kelurahan",
      withAsterisk: true,
    },
  },
};

export const CompanyBaseSchema = z.object({
  id: z.number().optional(),
  code: z.string({ required_error: "Kode harus diisi" }),
  name: z.string({ required_error: "Nama harus diisi" }),
  display_name: z.string({ required_error: "Ditampilkan harus diisi" }),
  phone_number: z.string().optional(),
  email: z.string().optional(),
  registered_number: z.string().optional(),
  registered_date: z
    .date({ invalid_type_error: "Tanggal lahir tidak valid" })
    .optional(),
  active: z.string({ required_error: "Input tidak valid" }),
  shipping_address: ShippingAddressSchema,
  billing_address: BillingAddressSchema,
  contacts: ContactSchema,
  contact_persons: ContactPersonSchema,
});

export function CompanySchema(
  intent: Intent | null,
  options?: {
    isCodeUnique?: (code: string) => Promise<boolean>;
    isPhoneNumberUnique?: (phone_number: string) => Promise<boolean>;
    isEmailUnique?: (email: string) => Promise<boolean>;
  },
) {
  const schema = CompanyBaseSchema;

  return schema
    .superRefine(({ code }, ctx) => {
      const isValidating =
        intent === null ||
        (intent.type === "validate" && intent.payload.name === "code");

      if (!isValidating) {
        ctx.addIssue({
          code: "custom",
          message: conformZodMessage.VALIDATION_SKIPPED,
        });
        return;
      }

      if (typeof options?.isCodeUnique !== "function") {
        ctx.addIssue({
          code: "custom",
          message: conformZodMessage.VALIDATION_UNDEFINED,
          fatal: true,
        });
        return;
      }

      if (!code) return;

      return options.isCodeUnique(code).then((isUnique) => {
        if (isUnique) {
          ctx.addIssue({ code: "custom", message: "Kode telah terpakai." });
        }
      });
    })
    .superRefine(({ phone_number }, ctx) => {
      const isValidating =
        intent === null ||
        (intent.type === "validate" && intent.payload.name === "phone_number");

      if (!isValidating) {
        ctx.addIssue({
          code: "custom",
          message: conformZodMessage.VALIDATION_SKIPPED,
        });
        return;
      }

      if (typeof options?.isPhoneNumberUnique !== "function") {
        ctx.addIssue({
          code: "custom",
          message: conformZodMessage.VALIDATION_UNDEFINED,
          fatal: true,
        });
        return;
      }

      if (!phone_number) return;
      return options.isPhoneNumberUnique(phone_number).then((isUnique) => {
        if (isUnique) {
          ctx.addIssue({
            code: "custom",
            message: "No. telepon telah terpakai.",
          });
        }
      });
    })
    .superRefine(({ email }, ctx) => {
      const isValidating =
        intent === null ||
        (intent.type === "validate" && intent.payload.name === "email");

      if (!isValidating) {
        ctx.addIssue({
          code: "custom",
          message: conformZodMessage.VALIDATION_SKIPPED,
        });
        return;
      }

      if (typeof options?.isEmailUnique !== "function") {
        ctx.addIssue({
          code: "custom",
          message: conformZodMessage.VALIDATION_UNDEFINED,
          fatal: true,
        });
        return;
      }

      if (!email) return;
      return options.isEmailUnique(email).then((isUnique) => {
        if (isUnique) {
          ctx.addIssue({
            code: "custom",
            message: "Email telah terpakai.",
          });
        }
      });
    });
}

export type CompanyBaseSchemaType = z.infer<typeof CompanyBaseSchema>;
