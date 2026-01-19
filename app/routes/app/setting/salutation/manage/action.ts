import { parseWithZod } from "@conform-to/zod";
import { Prisma } from "@prisma/client";
import { ActionFunctionArgs } from "@remix-run/node";
import * as Sentry from "@sentry/remix";

import { requireUserId } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { createDialogHeaders, redirectWithDialog } from "~/utils/dialog.server";
import { BadRequestError } from "~/utils/error.server";
import { logActivity } from "~/utils/log-activity.server";

import { SalutationSchema } from "./constant";

export const actionHandler = async (request: ActionFunctionArgs["request"]) => {
  try {
    await requireUserId(request);

    const formData = await request.formData();
    const submission = await parseWithZod(formData, {
      schema: (intent) =>
        SalutationSchema(intent, {
          async isCodeUnique(code) {
            const exists = await prisma.salutation.findUnique({
              where: { code },
            });

            if (exists && !formData.get("id")) {
              return true;
            }
            return false;
          },
        }),
      async: true,
    });

    if (submission.status !== "success") {
      return submission.reply();
    }

    const opt = submission.value?.id ? "update" : "new";

    const data: Record<string, unknown> = {
      id: submission.value.id,
      code: submission.value.code,
      name: submission.value.name,
      description: submission.value.description,
      active: submission.value.active === "y" ? true : false,
    };

    if (opt === "new") {
      delete data.id;

      const prismaData: Prisma.SalutationCreateInput =
        data as Prisma.SalutationCreateInput;

      await prisma.$transaction(async (tx) => {
        await tx.salutation.create({
          data: prismaData,
        });

        await logActivity({
          request,
          action: "Membuat master gelar",
          category: "Data Master",
        });
      });
    } else {
      const getSalutationById = await prisma.salutation.findFirst({
        where: { id: data.id as number },
      });

      if (!getSalutationById) {
        throw new BadRequestError("Bad Request", {
          title: "Gagal",
          description: "Data gelar tidak ditemukan.",
        });
      }

      const prismaData: Prisma.SalutationCreateInput =
        data as Prisma.SalutationCreateInput;
      await prisma.$transaction(async (tx) => {
        await tx.salutation.update({
          where: { id: data.id as number },
          data: prismaData,
        });

        await logActivity({
          request,
          action: "Mengubah master gelar",
          category: "Data Master",
        });
      });
    }

    return redirectWithDialog(`/app/setting/salutation`, {
      title: "Berhasil",
      type: "success",
      description: "Berhasil menambahkan data gelar",
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
