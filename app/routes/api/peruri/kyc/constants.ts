import { z } from "zod";

import { peruriBaseBodySchema } from "~/utils/peruri/constant";

export const peruriVerifyKycSchema = z
  .object({
    videoStream: z.string().min(1, "Rekaman video diperlukan"),
    action: z.enum(["verify", "renewal"], {
      required_error: "Tipe action harus ditentukan",
    }),
  })
  .merge(peruriBaseBodySchema);

export type PeruriVerifyKyc = z.infer<typeof peruriVerifyKycSchema>;
