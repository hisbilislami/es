import { z } from "zod";

export const loginFormSchema = z.object({
  username: z.string({ required_error: "Email harus diisi" }),
  password: z
    .string({ required_error: "Kata sandi harus diisi" })
    .min(8, "Kata sandi minimal harus 8 karakter"),
  remember_me: z.boolean().optional().default(false),
});
