import { z } from "zod";

import { addressSchema } from "./address.schema";
import { identitySchema } from "./identity.schema";
import { organizationSchema } from "./organization.schema";

export const formLabel = {
  name: {
    name: "name",
    label: "Nama",
    placeholder: "Nama",
    withAsterisk: true,
  },
  gender: {
    name: "gender",
    label: "Jenis Kelamin",
    placeholder: "Jenis Kelamin",
    withAsterisk: false,
  },
  place_of_birth: {
    name: "place_of_birth",
    label: "Tempat Lahir",
    placeholder: "Tempat Lahir",
    withAsterisk: false,
  },
  date_of_birth: {
    name: "date_of_birth",
    label: "Tanggal Lahir",
    placeholder: "Tanggal Lahir",
    withAsterisk: false,
  },
  type: {
    name: "type",
    label: "Jenis",
    placeholder: "Jenis",
    withAsterisk: true,
  },
  medical_record_number: {
    name: "medical_record_number",
    label: "Nomor RM",
    placeholder: "Nomor Rekam Medis",
    withAsterisk: false,
  },
  email: {
    name: "email",
    label: "Email",
    placeholder: "Email",
    withAsterisk: true,
  },
  phone: {
    name: "phone",
    label: "Telepon",
    placeholder: "Nomor Telepon",
    withAsterisk: true,
  },
};

export const personalInformationSchema = z
  .object({
    id: z.number().optional(),
    name: z.string({ required_error: "Nama harus diisi" }),
    gender: z.string().optional(),
    place_of_birth: z.string().optional(),
    date_of_birth: z.string().optional(),
    type: z.string({ required_error: "Jenis user signer harus dipilih" }),
    medical_record_number: z.string().optional(),
    email: z.string({ required_error: "Email harus diisi" }),
    phone: z.string({ required_error: "Nomor telepon harus diisi" }),
    identities: z.array(identitySchema).optional(),
  })
  .merge(addressSchema)
  .merge(organizationSchema)
  .superRefine((data, ctx) => {
    if (data.type === "employee") {
      if (!data.company) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["company"],
          message: "Nama harus diisi",
        });
      }
      if (!data.working_unit) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["working_unit"],
          message: "Unit kerja harus diisi",
        });
      }
      if (!data.job_position) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["job_position"],
          message: "Jabatan harus diisi",
        });
      }
    }
  });

export const genderOptions = [
  { label: "Laki-Laki", value: "M" },
  { label: "Perempuan", value: "F" },
];

export const userSignerTypeOptions = [
  { label: "Pegawai", value: "employee" },
  { label: "Pasien", value: "patient" },
];

export type UserSignerBaseSchemaType = z.infer<
  typeof personalInformationSchema
>;
