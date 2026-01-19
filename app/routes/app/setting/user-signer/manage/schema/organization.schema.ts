import { z } from "zod";

export const organizationLabel = {
  company: {
    name: "company",
    label: "Nama",
    placeholder: "Nama",
    withAsterisk: true,
  },
  working_unit: {
    name: "working_unit",
    label: "Unit Kerja",
    placeholder: "Unit Kerja",
    withAsterisk: true,
  },
  job_position: {
    name: "job_position",
    label: "Jabatan",
    placeholder: "Jabatan",
    withAsterisk: true,
  },
  practitioner_number: {
    name: "practitioner_number",
    label: "Nomor Praktik",
    placeholder: "Nomor Praktik",
    withAsterisk: false,
  },
  employee_number: {
    name: "employee_number",
    label: "Nomor Pegawai",
    placeholder: "Nomor Pegawai",
    withAsterisk: false,
  },
};

export const organizationSchema = z.object({
  company_employee_id: z.number().optional(),
  // company: z.string({ required_error: "Nama harus diisi" }),
  company: z.string().optional(),
  working_unit: z.string().optional(),
  job_position: z.string().optional(),
  practitioner_number: z.string().optional(),
  employee_number: z.string().optional(),
});

export type organizationItem = z.infer<typeof organizationSchema>;
