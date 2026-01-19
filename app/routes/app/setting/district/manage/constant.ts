import { z } from "zod";

export const districtFormLabel = {
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
  city: {
    name: "city",
    label: "Kota",
    placeholder: "Kota",
    withAsterisk: true,
  },
  province: {
    name: "province",
    readOnly: true,
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
  city: z.string({ required_error: "Kota harus diisi" }),
  province: z.string({ required_error: "Provinsi harus diisi" }),
  country: z.string({ required_error: "Negara harus diisi" }),
  active: z.string({ required_error: "Input tidak valid" }),
});
