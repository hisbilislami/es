import { z } from "zod";

export const timezoneFormLabel = {
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
  offset_sdt: {
    name: "offset_sdt",
    label: "Koreksi SDT",
    placeholder: "Koreksi SDT",
    withAsterisk: true,
  },
  offset_dst: {
    name: "offset_dst",
    label: "Koreksi DST",
    placeholder: "Koreksi DST",
    withAsterisk: true,
  },
  abbrevation_sdt: {
    name: "abbrevation_sdt",
    label: "Singkatan SDT",
    placeholder: "Singkatan SDT",
    withAsterisk: true,
  },
  abbrevation_dst: {
    name: "abbrevation_dst",
    label: "Singkatan DST",
    placeholder: "Singkatan DST",
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
  offset_sdt: z.string({ required_error: "Koreksi SDT harus diisi" }),
  offset_dst: z.string({ required_error: "Koreksi DST harus diisi" }),
  abbrevation_sdt: z.string({ required_error: "Singkatan SDT harus diisi" }),
  abbrevation_dst: z.string({ required_error: "Singkatan DST harus diisi" }),
  active: z.string({ required_error: "Input tidak valid" }),
});
