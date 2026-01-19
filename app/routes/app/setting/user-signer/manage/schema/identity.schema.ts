import { z } from "zod";

export const identityLabel = {
  identity_type: {
    name: "identity_type",
    label: "Jenis",
    placeholder: "Jenis",
    withAsterisk: true,
  },
  number: {
    name: "number",
    label: "Nomor",
    placeholder: "Nomor",
    withAsterisk: true,
  },
  country_issuer: {
    name: "country_issuer",
    label: "Negara Penerbit",
    placeholder: "Negara Penerbit",
    withAsterisk: true,
  },
  issuer: {
    name: "issuer",
    label: "Lembaga Penerbit",
    placeholder: "Lembaga Penerbit",
    withAsterisk: false,
  },
  expired_date: {
    name: "expired_date",
    label: "Kadaluarsa",
    placeholder: "Kadaluarsa",
    withAsterisk: false,
  },
  primary: {
    name: "primary",
    label: "Utama",
    placeholder: "Utama",
    withAsterisk: true,
  },
  file_identity: {
    name: "file_identity",
    label: "File",
    placeholder: "File",
  },
};

export const identitySchema = z.object({
  id: z.number().optional(),
  identity_type: z.string({ required_error: "Jenis identitas harus dipilih" }),
  identity_type_name: z.string(),
  number: z.string({ required_error: "Nommor harus diisi" }),
  country_issuer: z.string({ required_error: "Negara penerbit harus dipilih" }),
  country_issuer_name: z.string(),
  issuer: z.string().optional(),
  expired_date: z.string().optional(),
  primary: z.string().optional(),
  file_identity: z.any().optional(),
  file_identity_id: z.string().optional(),
  file_identity_name: z.string().optional(),
  file_identity_url: z.string().optional(),
  // file_identity: z.instanceof(File).optional(),
  // file_identity: z.union([z.string(), z.instanceof(File)]).optional(),
});

export type identityItem = z.infer<typeof identitySchema>;
