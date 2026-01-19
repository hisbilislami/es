import { ActionFunctionArgs, redirect } from "@remix-run/node";
import * as Sentry from "@sentry/remix";

import { requireUserId } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { createDialogHeaders } from "~/utils/dialog.server";
import { BadRequestError } from "~/utils/error.server";
import { formSessionStorage } from "~/utils/session.server";

export const actionHandler = async (request: ActionFunctionArgs["request"]) => {
  try {
    await requireUserId(request);

    const formData = await request.formData();
    const id = formData.get("id");
    const action = formData.get("action");

    const jobPosition = await prisma.jobPosition.findFirst({
      where: { id: Number(id) },
    });

    if (!jobPosition) {
      throw new BadRequestError("Bad Request", {
        title: "Gagal",
        description: "Data tidak valid",
      });
    }

    if (action === "delete") {
      await prisma.$transaction(async (tx) => {
        await tx.jobPosition.update({
          where: { id: Number(id) },
          data: {
            deleted_at: new Date(),
          },
        });
      });
      return redirect("/app/setting/job-position");
    }

    const session = await formSessionStorage.getSession();
    session.set("job_position_id", id);

    return redirect("/app/setting/job-position/manage", {
      headers: {
        "Set-Cookie": await formSessionStorage.commitSession(session),
      },
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
