import { parseWithZod } from "@conform-to/zod";
import { Prisma } from "@prisma/client";
import { ActionFunctionArgs } from "@remix-run/node";
import * as Sentry from "@sentry/remix";

import { requireUserId } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { createDialogHeaders, redirectWithDialog } from "~/utils/dialog.server";
import { BadRequestError } from "~/utils/error.server";
import { logActivity } from "~/utils/log-activity.server";

import { schema } from "./constant";

export const actionHandler = async (request: ActionFunctionArgs["request"]) => {
  try {
    await requireUserId(request);

    const checkUnique = <T extends "email" | "phone_number" | "username">(
      field: T,
    ) => {
      return async (value: string) => {
        if (!value?.trim()) return true;

        const where = { [field]: value } as Record<T, string>;

        let exists: unknown;

        if (field === "email" || field === "phone_number") {
          exists = await prisma.person.findFirst({
            where: where,
          });
        } else {
          exists = await prisma.user.findUnique({
            where: where as Prisma.UserWhereUniqueInput,
          });
        }

        if (exists && !formData.get("id")) {
          return true;
        }
        return false;
      };
    };

    const formData = await request.formData();

    let identityId: number | null;
    let countryId: number | null;

    const submission = await parseWithZod(formData, {
      schema: (intent) =>
        schema(intent, {
          async isNikUnique(nik) {
            const isIdentityExists = await prisma.identity.findFirst({
              where: {
                AND: [
                  {
                    OR: [{ code: "id" }, { code: "ID" }],
                  },
                  {
                    OR: [{ name: "ktp" }, { name: "KTP" }],
                  },
                ],
              },
            });

            if (!isIdentityExists) {
              return {
                status: false,
                message: "Master jenis identitas KTP tidak ditemukan.",
              };
            }

            const country = await prisma.country.findFirst({
              where: {
                AND: [
                  {
                    OR: [
                      { code: "ID" },
                      { code: "id" },
                      { name: "indonesia" },
                      { name: "INDONESIA" },
                      { iso_code: "ID" },
                      { iso_code: "id" },
                      { iso_name: "indonesia" },
                      { iso_name: "INDONESIA" },
                    ],
                  },
                  {
                    active: true,
                    deleted_at: null,
                  },
                ],
              },
            });

            if (!country) {
              return {
                status: false,
                message: "Master negara Indonesia tidak ditemukan.",
              };
            }

            if (
              isIdentityExists.min_length !== null &&
              nik.toString().length < Number(isIdentityExists?.min_length)
            ) {
              return {
                status: false,
                message:
                  "Minimal panjang NIK adalah " +
                  isIdentityExists.min_length +
                  " karakter.",
              };
            }

            if (
              isIdentityExists.max_length !== null &&
              nik.toString().length > Number(isIdentityExists?.min_length)
            ) {
              return {
                status: false,
                message:
                  "Maksimal panjang NIK adalah " +
                  isIdentityExists.max_length +
                  " karakter.",
              };
            }

            const exists = await prisma.personIdentity.findFirst({
              where: {
                number: nik,
                active: true,
                deleted_at: null,
                identity_id: isIdentityExists.id,
              },
            });

            if (exists) {
              return {
                status: false,
                message: "NIK sudah terdaftar.",
              };
            }

            identityId = isIdentityExists.id;
            countryId = country.id;
            return {
              status: true,
            };
          },
          isEmailUnique: checkUnique("email"),
          isUsernameUnique: checkUnique("username"),
          isPhoneNumberUnique: checkUnique("phone_number"),
        }),
      async: true,
    });

    if (submission.status !== "success") {
      return submission.reply();
    }

    const opt = submission.value?.id ? "update" : "new";

    const data: Record<string, unknown> = {
      id: submission.value.id,
      nik: submission.value.nik,
      username: submission.value.username,
      name: submission.value.name,
      email: submission.value.email,
      phone_number: submission.value.phone_number,
      role_id: submission.value.role,
    };

    const getUserById =
      opt === "update"
        ? await prisma.user.findFirst({ where: { id: data.id as number } })
        : null;

    if (opt === "new") {
      delete data.id;

      await prisma.$transaction(async (tx) => {
        await tx.person.create({
          include: {
            user: true,
          },
          data: {
            name: String(data.name),
            phone_number: String(data.phone_number),
            email: String(data.email),
            user: {
              create: [
                {
                  username: String(data.username),
                  password: "Password@123",
                  role_id: Number(data.role_id),
                },
              ],
            },
            person_identity: {
              create: [
                {
                  identity_id: Number(identityId),
                  country_id: Number(countryId),
                  number: String(data.nik),
                  primary: true,
                },
              ],
            },
          },
        });

        await logActivity({
          request,
          action: "Membuat master user",
          category: "Data Master",
        });
      });
    } else {
      if (!getUserById) {
        throw new BadRequestError("Bad Request", {
          title: "Gagal",
          description: "Data user tidak ditemukan.",
        });
      }

      await prisma.$transaction(async (tx) => {
        const personIdentity = await tx.personIdentity.findFirst({
          where: {
            person_id: Number(getUserById.person_id),
            country_id: Number(countryId),
            primary: true,
            deleted_at: null,
            active: true,
          },
        });

        await tx.person.update({
          where: { id: Number(getUserById.person_id) },
          data: {
            name: String(data.name),
            phone_number: String(data.phone_number),
            email: String(data.email),
          },
        });
        await tx.user.update({
          where: { id: data.id as number },
          data: {
            username: data.username as string,
            role_id: Number(data.role_id),
          },
        });

        if (personIdentity) {
          await tx.personIdentity.update({
            where: { id: personIdentity.id },
            data: { number: String(data.nik) },
          });
        } else {
          await tx.personIdentity.create({
            data: {
              person_id: Number(getUserById.person_id),
              identity_id: Number(identityId),
              country_id: Number(countryId),
              number: String(data.nik),
              primary: true,
            },
          });
        }

        await logActivity({
          request,
          action: "Mengubah master user",
          category: "Data Master",
        });
      });
    }

    return redirectWithDialog(`/app/setting/users`, {
      title: "Berhasil",
      type: "success",
      description: "Berhasil menambahkan data user",
    });
  } catch (error) {
    let response: Response;
    if (error instanceof BadRequestError) {
      Sentry.captureException(error);
      response = new Response(JSON.stringify(request), {
        headers: await createDialogHeaders({
          ...error.details,
          type: "error",
          confirmText: "Oke",
        }),
      });

      return response;
    }

    Sentry.captureException(new Error("Unknown error occurred"));
    response = new Response(JSON.stringify(request), {
      headers: await createDialogHeaders({
        type: "error",
        title: "Terjadi Kesalahan",
        description: "Silah coba beberapa saat lagi",
        confirmText: "Coba Lagi",
      }),
    });

    return response;
  }
};
