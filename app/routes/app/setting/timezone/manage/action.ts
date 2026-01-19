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

    const formData = await request.formData();
    const submission = parseWithZod(formData, {
      schema: schema,
    });

    if (submission.status !== "success") {
      return submission.reply();
    }

    const opt = submission.value?.id ? "update" : "new";

    const data: Record<string, unknown> = {
      id: submission.value.id,
      code: submission.value.code,
      name: submission.value.name,
      offset_sdt: submission.value.offset_sdt,
      offset_dst: submission.value.offset_dst,
      abbrevation_sdt: submission.value.abbrevation_sdt,
      abbrevation_dst: submission.value.abbrevation_dst,
      active: submission.value.active === "y" ? true : false,
    };

    if (opt === "new") {
      delete data.id;

      const prismaData: Prisma.TimezoneCreateInput =
        data as Prisma.TimezoneCreateInput;

      await prisma.$transaction(async (tx) => {
        await tx.timezone.create({
          data: prismaData,
        });

        await logActivity({
          request,
          action: "Membuat master zona waktu",
          category: "Data Master",
        });
      });
    } else {
      const getTimezoneById = await prisma.timezone.findFirst({
        where: { id: data.id as number },
      });

      if (!getTimezoneById) {
        throw new BadRequestError("Bad Request", {
          title: "Gagal",
          description: "Data zona waktu tidak ditemukan.",
        });
      }

      const prismaData: Prisma.TimezoneCreateInput =
        data as Prisma.TimezoneCreateInput;
      await prisma.$transaction(async (tx) => {
        await tx.timezone.update({
          where: { id: data.id as number },
          data: prismaData,
        });

        await logActivity({
          request,
          action: "Mengubah master zona waktu",
          category: "Data Master",
        });
      });
    }

    return redirectWithDialog(`/app/setting/timezone`, {
      title: "Berhasil",
      type: "success",
      description: "Berhasil menambahkan data zona waktu",
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
