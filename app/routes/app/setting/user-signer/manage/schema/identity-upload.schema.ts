import { z } from "zod";

export const identityFileSchema = z.object({
  id: z.string(),
  identity_file_id: z.string(),
});
