import { z } from "zod";

export const subdistrictFormLabel = {
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
  district: {
    name: "district",
    label: "Kecamatan",
    placeholder: "Kecamatan",
    withAsterisk: true,
  },
  city: {
    name: "city",
    label: "Kota",
    placeholder: "Kota",
    readOnly: true,
    withAsterisk: true,
  },
  province: {
    name: "province",
    label: "Provinsi",
    placeholder: "Provinsi",
    readOnly: true,
    withAsterisk: true,
  },
  country: {
    name: "country",
    label: "Negara",
    placeholder: "Negara",
    readOnly: true,
    withAsterisk: true,
  },
  postal_code: {
    name: "postal_code",
    label: "Kode Pos",
    placeholder: "Kode Pos",
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
  district: z.string({ required_error: "Kecamatan harus diisi" }),
  city: z.string({ required_error: "Kota / Kabupaten harus diisi" }),
  province: z.string({ required_error: "Provinsi harus diisi" }),
  country: z.string({ required_error: "Negara harus diisi" }),
  postal_code: z
    .number({ required_error: "Kode Pos harus diisi" })
    .min(111, "Kode Pos minimal 3 digit")
    .max(99999, "Kode Pos maksimal 5 digit"),
  active: z.string({ required_error: "Input tidak valid" }),
});
