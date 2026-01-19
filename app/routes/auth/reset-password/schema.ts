import { z } from "zod";

export const formLabel = {
  password: {
    label: "Sandi Baru",
    placeholder: "Sandi Baru",
    withAsterisk: true,
    autoComplete: "off",
    name: "password",
  },
  confirm_password: {
    label: "Konfirmasi Sandi Baru",
    placeholder: "Konfirmasi Sandi Baru",
    withAsterisk: true,
    autoComplete: "off",
    name: "confirm_password",
  },
};

export const schema = z
  .object({
    password: z
      .string()
      .min(8, { message: "Kata sandi harus terdiri dari minimal 8 karakter" }),
    confirm_password: z.string(),
    token: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Kata sandi tidak cocok",
    path: ["confirm_password"],
  });
