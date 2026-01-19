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

async function actionHandler(request: ActionFunctionArgs["request"]) {
  try {
    await requireUserId(request);

    const formData = await request.formData();
    const submission = parseWithZod(formData, {
      schema,
    });

    if (submission.status !== "success") {
      return submission.reply();
    }

    const opt = submission.value?.id ? "update" : "new";

    const data: Record<string, unknown> = {
      id: submission.value.id,
      code: submission.value.code,
      title: submission.value.title,
      parent_id: submission.value?.module,
      link: submission.value?.link,
      position: submission.value.position,
      group: submission.value?.group,
      group_position: submission.value?.group_position,
      icon: submission.value.icon,
      category: submission.value.category,
      active: submission.value.active === "y" ? true : false,
    };

    if (submission.value.type === "modul") {
      delete data.parent_id;
      delete data.link;
      delete data.group;
      delete data.group_position;
      data.category = "inside";
    }

    if (opt === "new") {
      const existingMenu = await prisma.menus.findFirst({
        where: { code: String(data.code) },
      });

      if (existingMenu) {
        return submission.reply({
          fieldErrors: { code: ["Kode memu telah dipakai"] },
        });
      }

      delete data.id;

      // convert object to prisma object
      const prismaData: Prisma.MenusCreateInput =
        data as Prisma.MenusCreateInput;

      await prisma.$transaction(async (tx) => {
        await tx.menus.create({
          data: prismaData,
        });
      });

      await logActivity({
        request,
        action: "Membuat master menu",
        category: "Data Master",
      });
    }

    if (opt === "update") {
      const menuId = Number(data.id);

      const existingMenu = await prisma.menus.findUnique({
        where: { id: menuId },
      });

      if (!existingMenu) {
        throw new BadRequestError("Bad Request", {
          title: "Gagal",
          description: "ID menu tidak ditemukan.",
        });
      }

      // Only map allowed fields to avoid accidental overwrite
      const updateData: Prisma.MenusUpdateInput = {
        code: data.code ?? undefined,
        title: data.title ?? undefined,
        parent:
          typeof data.parent_id === "number"
            ? { connect: { id: data.parent_id } }
            : { disconnect: true },
        link: data.link ?? null,
        position: data.position ?? undefined,
        group: data.group ?? null,
        group_position: data.group_position ?? null,
        icon: data.icon ?? null,
        is_parent_sub_menu: data.is_parent_sub_menu ?? undefined,
        category: data.category ?? undefined,
        active: data.active ?? undefined,
        deleted_at: data.deleted_at ?? null,
      };

      await prisma.$transaction(async (tx) => {
        await tx.menus.update({
          where: { id: menuId },
          data: updateData,
        });

        await logActivity({
          request,
          category: "Data Master",
          action: "Mengubah master menu",
        });
      });
    }

    return redirectWithDialog(`/app/setting/menu`, {
      title: "Berhasil",
      type: "success",
      description: "Berhasil menambahkan menu",
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
}

export default actionHandler;
