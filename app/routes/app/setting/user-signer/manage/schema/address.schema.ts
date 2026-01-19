import { z } from "zod";

export const addressLabel = {
  address: {
    name: "address",
    label: "Alamat",
    placeholder: "Alamat",
    withAsterisk: true,
  },
  country: {
    name: "country",
    label: "Negara",
    placeholder: "Negara",
    withAsterisk: true,
  },
  province: {
    name: "province",
    label: "Provinsi",
    placeholder: "Provinsi",
    withAsterisk: true,
  },
  city: {
    name: "city",
    label: "Kota / Kabupaten",
    placeholder: "Kota / Kabupaten",
    withAsterisk: true,
  },
  district: {
    name: "district",
    label: "Kecamatan",
    placeholder: "Kecamatan",
    withAsterisk: true,
  },
  subdistrict: {
    name: "subdistrict",
    label: "Desa / Kelurahan",
    placeholder: "Desa / Kelurahan",
    withAsterisk: true,
  },
  postal_code: {
    name: "postal_code",
    label: "Kode Pos",
    placeholder: "Kode Pos",
    withAsterisk: false,
  },
};

export const addressSchema = z.object({
  address: z.string({ required_error: "Alamat harus diisi" }),
  country: z.string({ required_error: "Negara harus dipilih" }),
  province: z.string({ required_error: "Provinsi harus dipilih" }),
  city: z.string({ required_error: "Kota / Kabupaten harus dipilih" }),
  district: z.string({ required_error: "Kecamatan / District harus dipilih" }),
  subdistrict: z.string({ required_error: "Desa / Kelurahan harus dipilih" }),
  postal_code: z.string().optional(),
});
