import { z } from "zod";

import { peruriBaseBodySchema } from "./constant";

export type BasePeruriApiResponse<T> = {
  resultCode: string;
  resultDesc: string;
  data?: T;
  errorMessage: string;
};

export type PeruriGetTokenResponse = BasePeruriApiResponse<{
  jwt: string;
  expiredDate: string;
}>;

export type PeruriBaseBodySchema = z.infer<typeof peruriBaseBodySchema>;
