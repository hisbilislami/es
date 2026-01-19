import { z } from "zod";

export const handSignatureFormSchema = z.object({
  fileBase64: z
    .string({
      required_error:
        "Pastikan file sudah dipilih atau ditambahkan dengan benar",
    })
    .min(1, "Pastikan file sudah dipilih atau ditambahkan dengan benar"),
  fileObject: z
    .instanceof(File, {
      message: "Pastikan file sudah dipilih atau ditambahkan dengan benar",
    })
    .optional(),
});
