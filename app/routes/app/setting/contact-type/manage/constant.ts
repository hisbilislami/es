import { Intent } from "@conform-to/react";
import { conformZodMessage } from "@conform-to/zod";
import { z } from "zod";

export const contactTypeFormLabel = {
  code: {
    name: "code",
    label: "Kode",
    placeholder: "Kode",
    withAsterisk: true,
  },
  name: {
    name: "name",
    label: "Nama",
    placeholder: "Name",
    withAsterisk: true,
  },
  description: {
    name: "description",
    label: "Deskripsi",
    placeholder: "Deskripsi",
    withAsterisk: false,
  },
  active: {
    name: "active",
    label: "Status",
    placeholder: "Status",
    withAsterisk: true,
  },
};

export function ContactTypeSchema(
  intent: Intent | null,
  options?: {
    isCodeUnique?: (code: string) => Promise<boolean>;
  },
) {
  return z.object({
    id: z.number().optional(),
    code: z.string({ required_error: "Kode harus diisi" }).pipe(
      z.string().superRefine((code, ctx) => {
        const isValidatingCode =
          intent === null ||
          (intent.type === "validate" && intent.payload.name === "code");

        if (!isValidatingCode) {
          ctx.addIssue({
            code: "custom",
            message: conformZodMessage.VALIDATION_SKIPPED,
          });

          return;
        }

        if (typeof options?.isCodeUnique !== "function") {
          ctx.addIssue({
            code: "custom",
            message: conformZodMessage.VALIDATION_UNDEFINED,
            fatal: true,
          });
          return;
        }

        return options.isCodeUnique(code).then((isUnique) => {
          if (isUnique) {
            ctx.addIssue({
              code: "custom",
              message: "Kode telah terpakai.",
            });
          }
        });
      }),
    ),
    name: z.string({ required_error: "Nama harus diisi" }),
    description: z.string().optional(),
    active: z.string({ required_error: "Input tidak valid" }),
  });
}
