import { z } from "zod";

export const filterSchema = z.object({
  role: z.string().optional(),
});
