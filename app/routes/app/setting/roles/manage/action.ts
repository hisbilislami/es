import { parseWithZod } from "@conform-to/zod";
import { Prisma, Roles as RolesType } from "@prisma/client";
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

    await prisma.$transaction(async (tx) => {
      const dataRole: Record<string, unknown> = {
        id: submission.value.id,
        code: submission.value.code,
        name: submission.value.name,
        active: submission.value.active === "y",
      };

      let role: RolesType;

      if (opt === "new") {
        role = await tx.roles.create({
          data: dataRole as Prisma.RolesCreateInput,
        });

        await logActivity({
          request,
          action: "Membuat master role",
          category: "Data Master",
        });
      } else {
        role = await tx.roles.update({
          where: { id: Number(dataRole.id) },
          data: dataRole as Prisma.RolesUpdateInput,
        });

        await logActivity({
          request,
          action: "Mengubah master role",
          category: "Data Master",
        });
      }

      const permissions = submission.value.permissions || [];

      for (const p of permissions) {
        const baseData = {
          create: p.create,
          read: p.read,
          update: p.update,
          delete: p.delete,
          active: true,
        };

        const existing = await tx.rolesHasMenus.findFirst({
          where: {
            menu_id: p.menu_id,
            role_id: role.id,
            active: true,
            deleted_at: null,
          },
        });

        if (existing) {
          await tx.rolesHasMenus.update({
            where: { id: existing.id },
            data: baseData,
          });
        } else {
          await tx.rolesHasMenus.create({
            data: {
              ...baseData,
              rel_rhm_roles: {
                connect: { id: role.id },
              },
              rel_rhm_menus: {
                connect: { id: p.menu_id },
              },
            },
          });
        }
      }
    });

    return redirectWithDialog(`/app/setting/roles`, {
      title: "Berhasil",
      type: "success",
      description: "Berhasil menambahkan menu",
    });
  } catch (error) {
    let response: Response;

    if (error instanceof BadRequestError) {
      Sentry.captureException(error);
      response = new Response(JSON.stringify(error), {
        headers: await createDialogHeaders({
          ...error.details,
          type: "error",
          confirmText: "Oke",
        }),
      });
      return response;
    }

    Sentry.captureException(new Error("Unknown error occurred"));
    response = new Response(JSON.stringify(error), {
      headers: await createDialogHeaders({
        type: "error",
        title: "Terjadi Kesalahan",
        description: "Silahkan coba beberapa saat lagi",
        confirmText: "Coba Lagi",
      }),
    });
    return response;
  }
}

export default actionHandler;
