import { LoaderFunctionArgs } from "@remix-run/node";
import * as Sentry from "@sentry/remix";

import { requireUserId } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { createDialogHeaders } from "~/utils/dialog.server";
import { BadRequestError } from "~/utils/error.server";

export const loaderHandler = async (request: LoaderFunctionArgs["request"]) => {
  try {
    const userId = await requireUserId(request);

    const cert = await prisma.certificatePeruri.findFirst({
      where: { user_id: userId, deleted_at: null },
    });

    return {
      data: cert,
    };
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
