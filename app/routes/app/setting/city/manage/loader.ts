import { data, LoaderFunctionArgs } from "@remix-run/node";
import * as Sentry from "@sentry/remix";

import { requireUserId } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { createDialogHeaders } from "~/utils/dialog.server";
import { formSessionStorage } from "~/utils/session.server";

export const loaderHandler = async (request: LoaderFunctionArgs["request"]) => {
  try {
    await requireUserId(request);

    const session = await formSessionStorage.getSession(
      request.headers.get("Cookie"),
    );

    let id = session.get("city_id");

    if (!id) {
      id = null;
    }

    const city = await prisma.city.findFirst({
      where: { id: Number(id) },
      include: {
        province: {
          include: {
            country: true,
          },
        },
        timezone: true,
      },
    });

    return data({
      data: city ?? null,
      status: "success",
    });
  } catch (error) {
    if (error instanceof Error) {
      Sentry.captureException(error);
    }

    Sentry.captureException(new Error("Unknown error occured."));
    throw new Response(JSON.stringify(request), {
      headers: await createDialogHeaders({
        type: "error",
        title: "Terjadi kesalahan",
        description: "Silakan coba kembali beberapa saat lagi.",
        confirmText: "Coba lagi",
      }),
    });
  }
};
