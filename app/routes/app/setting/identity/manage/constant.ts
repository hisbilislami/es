import { z } from "zod";

export const identityFormLabel = {
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
  min_length: {
    name: "min_length",
    label: "Panjang Minimal",
    placeholder: "Panjang Minimal",
    withAsterisk: false,
  },
  max_length: {
    name: "max_length",
    label: "Panjang Maksimal",
    placeholder: "Panjang Maksimal",
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
  min_length: z.string().optional(),
  max_length: z.string().optional(),
  active: z.string({ required_error: "Input tidak valid" }),
});
