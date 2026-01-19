import { z } from "zod";

export const schema = z.object({
  name: z.string(),
  reference_number: z.string(),
  registration_number: z.string(),
  document_date: z.string().date(),
  document_url: z.string(),
  signers: z.array(
    z.object({
      name: z.string(),
      email: z.string(),
      position: z.enum(["practitioner", "patient"]),
      entity_number: z.string().optional(),
    }),
  ),
});

export type Signers = {
  name: string;
  email: string;
  position: "practitioner" | "patient";
  entity_number?: string;
};

export type RequestBody = {
  name: string;
  reference_number: string;
  registration_number: string;
  document_date: string;
  document_url: string;
  signers: Signers[];
};
