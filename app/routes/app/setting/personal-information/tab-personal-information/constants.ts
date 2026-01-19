import { z } from "zod";

export const personalInformationFormLabel = {
  name: {
    name: "name",
    label: "Nama Lengkap",
    withAsterisk: true,
  },
  gender: {
    name: "gender",
    label: "Jenis Kelamin",
    placeholder: "Pilih Jenis Kelamin",
    withAsterisk: true,
  },
  placeOfBirth: {
    name: "placeOfBirth",
    label: "Tempat Lahir",
    withAsterisk: true,
  },
  dateOfBirth: {
    name: "dateOfBirth",
    label: "Tanggal Lahir",
    withAsterisk: true,
  },
  medicalRecordNumber: {
    name: "medicalRecordNumber",
    label: "No. Rekam Medis",
  },
  employeeNumber: {
    name: "employeeNumber",
    label: "No. Pegawai",
  },
  ktpNumber: {
    name: "ktpNumber",
    label: "NIK",
    withAsterisk: true,
  },
  ktpFile: {
    name: "ktpFile",
    label: "",
  },
  npwpNumber: {
    name: "npwpNumber",
    label: "NPWP",
  },
  npwpFile: {
    name: "npwpFile",
    label: "",
  },
  organizationUnit: {
    name: "organizationUnit",
    label: "Unit Organisasi",
  },
  workUnit: {
    name: "workUnit",
    label: "Unit Kerja",
  },
  occupation: {
    name: "occupation",
    label: "Posisi Jabatan",
  },
  privileges: {
    name: "privileges",
    label: "Hak Akses",
  },
  phoneNumber: {
    name: "phoneNumber",
    label: "Nomor Telepon",
  },
  email: {
    name: "email",
    label: "Email",
    withAsterisk: true,
  },
  address: {
    name: "address",
    label: "Alamat",
  },
  city: {
    name: "city",
    label: "Kota",
  },
  province: {
    name: "province",
    label: "Provinsi",
  },
};

export const genderOptions = [
  { label: "Laki-Laki", value: "M" },
  { label: "Perempuan", value: "F" },
];

export const personalInformationFormSchema = z.object({
  name: z
    .string({ required_error: "Nama depan harus diisi" })
    .min(1, "Nama depan harus diisi"),
  gender: z
    .string({ required_error: "Jenis kelamin harus diisi" })
    .min(1, "Jenis kelamin harus diisi"),
  placeOfBirth: z
    .string({ required_error: "Tempat lahir harus diisi" })
    .min(1, "Tempat lahir harus diisi"),
  dateOfBirth: z.date({
    required_error: "Tanggal lahir harus diisi",
    invalid_type_error: "Tanggal lahir tidak valid",
  }),
  medicalRecordNumber: z.string().optional(),
  employeeNumber: z.string().optional(),
  ktpNumber: z
    .string({ required_error: "NIK harus diisi" })
    .min(16, "NIK harus diisi")
    .max(16, "NIK tidak boleh lebih dari 16 digit"),
  ktpFile: z.any().optional(),
  ktpFileId: z.string().optional(),
  npwpNumber: z
    .string()
    .max(15, "Nomor NPWP tidak boleh lebih dari 15 digit")
    .optional(),
  npwpFile: z.any().optional(),
  npwpFileId: z.string().optional(),
  organizationUnit: z.string().optional(),
  workUnit: z.string().optional(),
  occupation: z.string().optional(),
  privileges: z
    .string({ required_error: "Hak akses harus diisi" })
    .min(1, "Hak akses harus diisi"),
  phoneNumber: z
    .string({ required_error: "Nomor telepon harus diisi" })
    .min(11, "Nomor telepon minimal 11 digit")
    .max(13, "Nomor telepon tidak boleh lebih dari 13 digit"),
  email: z.string().optional(),
  address: z
    .string({ required_error: "Alamat harus diisi" })
    .min(1, "Alamat harus diisi"),
  city: z
    .string({ required_error: "Kota harus diisi" })
    .min(1, "Kota harus diisi"),
  province: z
    .string({ required_error: "Provinsi harus diisi" })
    .min(1, "Provinsi harus diisi"),
});
