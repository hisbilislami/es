import { FieldMetadata } from "@conform-to/react";
import { z } from "zod";

export const ContactItemSchema = z.object({
  id: z.string().optional(),
  contact_type: z.string({ required_error: "Jenis kontak harus dipilih" }),
  contact_type_name: z.string(),
  primary: z.string().default("0"),
  description: z.string({ required_error: "Deskripsi harus diisi" }),
});

export const ContactSchema = z.array(ContactItemSchema);

// Types
export type Contact = z.infer<typeof ContactSchema>;
export type ContactItem = z.infer<typeof ContactSchema>[number];

export type CCType = FieldMetadata<Contact>;
export type ContactItemFields = FieldMetadata<ContactItem>;
