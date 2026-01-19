import { z } from "zod";

export const provinceFormLabel = {
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
  country: {
    name: "country",
    label: "Negara",
    placeholder: "Negara",
    withAsterisk: true,
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
  country: z.string({ required_error: "Negara harus dipilih" }),
  active: z.string({ required_error: "Input tidak valid" }),
});
