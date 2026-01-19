import { FieldMetadata } from "@conform-to/react";
import { z } from "zod";

export const ContactPersonItemSchema = z.object({
  id: z.string().optional(),
  salutation: z.string({ required_error: "Gelar harus dipilih" }),
  salutation_name: z.string(),
  first_name: z.string({ required_error: "Nama depan harus diisi" }),
  last_name: z.string().optional(),
  phone_number: z.string({ required_error: "Nomor telepon harus diisi" }),
  email: z
    .string({ required_error: "email harus diisi" })
    .email("Email tidak valid"),
});

export const ContactPersonSchema = z.array(ContactPersonItemSchema);

// Types
export type ContactPerson = z.infer<typeof ContactPersonSchema>;
export type ContactPersonItem = z.infer<typeof ContactPersonSchema>[number];

export type CCPType = FieldMetadata<ContactPerson>;
export type ContactPersonItemFields = FieldMetadata<ContactPersonItem>;
