import { FieldMetadata } from "@conform-to/react";
import { z } from "zod";

import { companyFormLabel } from "./company.schema";

export const BillingAddressSchema = z.object({
  id: z.number().optional(),
  address_type: z.string({ required_error: "Jenis alamat harus diisi." }),
  attention: z
    .string({ required_error: "Atensi harus diisi" })
    .max(50, { message: "Maksimum atensi 50 karakter." }),
  address: z.string({ required_error: "Alamat harus diisi" }),
  country: z.string({ required_error: "Negara harus dipilih" }),
  province: z.string({ required_error: "Provinsi harus dipilih" }),
  city: z.string({ required_error: "Kota harus dipilih" }),
  district: z.string({ required_error: "Kecamatan harus dipilih" }),
  subdistrict: z.string({
    required_error: "Desa / Kelurahan harus dipilih",
  }),
});

export const ShippingAddressSchema = z.object({
  id: z.number().optional(),
  address_type: z.string({ required_error: "Jenis alamat harus diisi." }),
  attention: z
    .string({ required_error: "Atensi harus diisi" })
    .max(50, { message: "Maksimum atensi 50 karakter." }),
  address: z.string({ required_error: "Alamat harus diisi" }),
  country: z.string({ required_error: "Negara harus dipilih" }),
  province: z.string({ required_error: "Provinsi harus dipilih" }),
  city: z.string({ required_error: "Kota harus dipilih" }),
  district: z.string({ required_error: "Kecamatan harus dipilih" }),
  subdistrict: z.string({
    required_error: "Desa / Kelurahan harus dipilih",
  }),
});

// Types
export type BillingAddress = z.infer<typeof BillingAddressSchema>;
export type ShippingAddress = z.infer<typeof ShippingAddressSchema>;

export type CAType = {
  billingFields: FieldMetadata<BillingAddress>;
  shippingFields: FieldMetadata<ShippingAddress>;
  formLabel: Pick<
    typeof companyFormLabel,
    "shipping_address" | "billing_address"
  >;
};
