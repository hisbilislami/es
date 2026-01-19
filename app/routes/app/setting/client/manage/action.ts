import crypto from "crypto";

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

const generateApiKey = () => crypto.randomBytes(32).toString("hex");

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
      client_id: submission.value.client_id,
      api_url: submission.value.api_url,
      active: submission.value.active === "y" ? true : false,
    };

    if (opt === "new") {
      data.api_key = generateApiKey();

      delete data.id;

      const prismaData: Prisma.ClientCreateInput =
        data as Prisma.ClientCreateInput;

      await prisma.$transaction(async (tx) => {
        await tx.client.create({
          data: prismaData,
        });

        await logActivity({
          request,
          action: "Membuat master client",
          category: "Data Master",
        });
      });
    } else {
      const getClientById = await prisma.client.findFirst({
        where: { id: data.id as number },
      });

      if (!getClientById) {
        throw new BadRequestError("Bad Request", {
          title: "Gagal",
          description: "Data client tidak ditemukan.",
        });
      }

      const prismaData: Prisma.ClientCreateInput =
        data as Prisma.ClientCreateInput;
      await prisma.$transaction(async (tx) => {
        await tx.client.update({
          where: { id: data.id as number },
          data: prismaData,
        });

        await logActivity({
          request,
          action: "Mengubah master client",
          category: "Data Master",
        });
      });
    }

    return redirectWithDialog(`/app/setting/client`, {
      title: "Berhasil",
      type: "success",
      description: "Berhasil menambahkan data client",
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
