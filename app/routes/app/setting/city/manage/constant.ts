import { z } from "zod";

export const cityFormLabel = {
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
  sni_name: {
    name: "sni_name",
    label: "Nama SNI",
    placeholder: "Nama SNI",
    withAsterisk: false,
  },
  province: {
    name: "province",
    label: "Provinsi",
    placeholder: "Provinsi",
    withAsterisk: true,
  },
  country: {
    name: "country",
    readOnly: true,
    label: "Negara",
    placeholder: "Negara",
    withAsterisk: true,
  },
  timezone: {
    name: "timezone",
    label: "Zona Waktu",
    placeholder: "Zona Waktu",
    withAsterisk: false,
  },
  active: {
    name: "active",
    label: "Status",
    placeholder: "Status",
    withAsterisk: true,
  },
};

export const schema = z.object({
  id: z.number().optional(),
  code: z.string({ required_error: "Kode harus diisi" }),
  name: z.string({ required_error: "Nama harus diisi" }),
  sni_name: z.string().optional(),
  province: z.string({ required_error: "Provinsi harus diisi" }),
  country: z.string({ required_error: "Negara harus diisi" }),
  timezone: z.string().optional(),
  active: z.string({ required_error: "Input tidak valid" }),
});
