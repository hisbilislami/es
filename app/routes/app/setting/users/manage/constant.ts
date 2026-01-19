import { Intent } from "@conform-to/react";
import { conformZodMessage } from "@conform-to/zod";
import { z } from "zod";

export const userFormLabel = {
  nik: {
    name: "nik",
    label: "NIK",
    placeholder: "NIK",
    withAsterisk: true,
  },
  username: {
    name: "username",
    label: "Username",
    placeholder: "Username",
    withAsterisk: true,
  },
  name: {
    name: "name",
    label: "Nama",
    placeholder: "Nama",
    withAsterisk: true,
  },
  email: {
    name: "email",
    label: "Email",
    placeholder: "Email",
    withAsterisk: true,
  },
  phone_number: {
    name: "phone_number",
    label: "Nomor Ponsel",
    placeholder: "Nomor Ponsel",
    withAsterisk: true,
  },
  role: {
    name: "role",
    label: "Role",
    placeholder: "Role",
    withAsterisk: true,
  },
};

type NikUniqueCheck = {
  status: boolean;
  message?: string;
};

export const schema = (
  intent: Intent | null,
  options?: {
    isNikUnique?: (nik: string) => Promise<NikUniqueCheck>;
    isEmailUnique?: (email: string) => Promise<boolean>;
    isUsernameUnique?: (username: string) => Promise<boolean>;
    isPhoneNumberUnique?: (phoneNumber: string) => Promise<boolean>;
  },
) => {
  return z.object({
    id: z.number().optional(),
    person_id: z.number().optional(),
    nik: z
      .string({ required_error: "NIK harus diisi" })
      .superRefine((nik, ctx) => {
        const isValidatingNik =
          intent === null ||
          (intent.type === "validate" && intent.payload.name === "nik");

        if (!isValidatingNik) {
          ctx.addIssue({
            code: "custom",
            message: conformZodMessage.VALIDATION_SKIPPED,
          });
          return;
        }

        if (typeof options?.isNikUnique !== "function") {
          ctx.addIssue({
            code: "custom",
            message: conformZodMessage.VALIDATION_UNDEFINED,
            fatal: true,
          });
          return;
        }

        return options.isNikUnique(nik).then((isUnique) => {
          if (isUnique.status === false) {
            ctx.addIssue({
              code: "custom",
              message: isUnique.message?.toString(),
            });
          }
        });
      }),
    username: z.string({ required_error: "Username harus diisi" }).pipe(
      z.string().superRefine((username, ctx) => {
        const isValidatingUsername =
          intent === null ||
          (intent.type === "validate" && intent.payload.name === "username");

        if (!isValidatingUsername) {
          ctx.addIssue({
            code: "custom",
            message: conformZodMessage.VALIDATION_SKIPPED,
          });
          return;
        }

        if (typeof options?.isUsernameUnique !== "function") {
          ctx.addIssue({
            code: "custom",
            message: conformZodMessage.VALIDATION_UNDEFINED,
            fatal: true,
          });
          return;
        }

        return options.isUsernameUnique(username).then((found) => {
          if (found) {
            ctx.addIssue({
              code: "custom",
              message: "Username telah terdaftar.",
            });
          }
        });
      }),
    ),
    name: z.string({ required_error: "Nama harus diisi" }),
    email: z
      .string({ required_error: "Email harus diisi" })
      .email({ message: "Format email tidak valid" })
      .superRefine((email, ctx) => {
        const isValidatingEmail =
          intent === null ||
          (intent.type === "validate" && intent.payload.name === "email");

        if (!isValidatingEmail) {
          ctx.addIssue({
            code: "custom",
            message: conformZodMessage.VALIDATION_SKIPPED,
          });
          return;
        }

        if (typeof options?.isEmailUnique !== "function") {
          ctx.addIssue({
            code: "custom",
            message: conformZodMessage.VALIDATION_UNDEFINED,
            fatal: true,
          });
          return;
        }

        return options.isEmailUnique(email).then((found) => {
          if (found) {
            ctx.addIssue({
              code: "custom",
              message: "Email telah terdaftar.",
            });
          }
        });
      }),
    phone_number: z
      .string({ required_error: "Nomor ponsel harus diisi" })
      .superRefine((phoneNumber, ctx) => {
        const isValidatingPhoneNumber =
          intent === null ||
          (intent.type === "validate" &&
            intent.payload.name === "phone_number");

        if (!isValidatingPhoneNumber) {
          ctx.addIssue({
            code: "custom",
            message: conformZodMessage.VALIDATION_SKIPPED,
          });
          return;
        }

        if (typeof options?.isPhoneNumberUnique !== "function") {
          ctx.addIssue({
            code: "custom",
            message: conformZodMessage.VALIDATION_UNDEFINED,
            fatal: true,
          });
          return;
        }

        return options.isPhoneNumberUnique(phoneNumber).then((found) => {
          if (found) {
            ctx.addIssue({
              code: "custom",
              message: "Nomor ponsel telah terdaftar.",
            });
          }
        });
      }),
    role: z.string({ required_error: "Role harus dipilih" }),
  });
};
