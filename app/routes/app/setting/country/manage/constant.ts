import { z } from "zod";

export const countryFormLabel = {
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
  iso_code: {
    name: "iso_code",
    label: "Kode ISO",
    placeholder: "Kode ISO",
    withAsterisk: true,
  },
  iso_name: {
    name: "iso_name",
    label: "Nama ISO",
    placeholder: "Nama ISO",
    withAsterisk: true,
  },
  phone_code: {
    name: "phone_code",
    label: "Kode Area",
    placeholder: "+62",
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
  iso_code: z.string({ required_error: "Kode ISO harus diisi" }),
  iso_name: z.string({ required_error: "Nama ISO harus diisi" }),
  phone_code: z.string({ required_error: "Kode area harus diisi" }),
  active: z.string({ required_error: "Input tidak valid" }),
});
