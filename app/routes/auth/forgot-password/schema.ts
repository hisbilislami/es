import { z } from "zod";

export const schema = z.object({
  email: z.string().email("Format email tidak valid"),
});
