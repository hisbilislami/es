import { z } from "zod";

import { peruriBaseBodySchema } from "~/utils/peruri/constant";

export enum UserType {
  INDIVIDUAL = "INDIVIDUAL",
  CORPORATE = "CORPORATE",
}

export const peruriRegisterUserSchema = z
  .object({
    name: z.string(),
    phone: z.string(),
    password: z.string().optional().nullable(),
    type: z.nativeEnum(UserType),
    ktp: z.string(),
    ktpPhoto: z.string(),
    npwp: z.string().optional().nullable(),
    npwpPhoto: z.string().optional().nullable(),
    selfPhoto: z.string().optional().nullable(),
    address: z.string(),
    city: z.string(),
    province: z.string(),
    gender: z.string(),
    placeOfBirth: z.string(),
    dateOfBirth: z.string(),
    orgUnit: z.string().optional().nullable(),
    workUnit: z.string().optional().nullable(),
    position: z.string().optional().nullable(),
  })
  .merge(peruriBaseBodySchema);

export type PeruriRegisterUser = z.infer<typeof peruriRegisterUserSchema>;
