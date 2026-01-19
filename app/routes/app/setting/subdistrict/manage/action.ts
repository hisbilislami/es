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
      district_id: Number(submission.value.district),
      postal_code: String(submission.value.postal_code),
      active: submission.value.active === "y" ? true : false,
    };

    if (opt === "new") {
      delete data.id;

      const prismaData: Prisma.SubdistrictCreateInput =
        data as Prisma.SubdistrictCreateInput;

      await prisma.$transaction(async (tx) => {
        await tx.subdistrict.create({
          data: prismaData,
        });

        await logActivity({
          request,
          action: "Membuat master kelurahan / desa",
          category: "Data Master",
        });
      });
    } else {
      const getSubdistrictById = await prisma.subdistrict.findFirst({
        where: { id: data.id as number },
      });

      if (!getSubdistrictById) {
        throw new BadRequestError("Bad Request", {
          title: "Gagal",
          description: "Data kelurahan / desa tidak ditemukan.",
        });
      }

      const prismaData: Prisma.SubdistrictCreateInput =
        data as Prisma.SubdistrictCreateInput;
      await prisma.$transaction(async (tx) => {
        await tx.subdistrict.update({
          where: { id: data.id as number },
          data: prismaData,
        });

        await logActivity({
          request,
          action: "Mengubah master kelurahan / desa",
          category: "Data Master",
        });
      });
    }

    return redirectWithDialog(`/app/setting/subdistrict`, {
      title: "Berhasil",
      type: "success",
      description: "Berhasil menambahkan data kecamatan/subdistrict",
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
