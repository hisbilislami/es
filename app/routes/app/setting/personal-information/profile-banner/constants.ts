import { z } from "zod";

export const profilePhotoSchema = z.object({
  photoProfileId: z.string(),
});
