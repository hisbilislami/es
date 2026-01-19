import { z } from "zod";

export const peruriBaseBodySchema = z.object({
  email: z.string(),
  systemId: z.string(),
});
