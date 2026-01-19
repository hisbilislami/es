import { parseWithZod } from "@conform-to/zod";
import { ActionFunctionArgs } from "@remix-run/node";
import * as Sentry from "@sentry/remix";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { requireAnonymous } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { createDialogHeaders, redirectWithDialog } from "~/utils/dialog.server";
import { BadRequestError } from "~/utils/error.server";
import { logActivity } from "~/utils/log-activity.server";
import redis from "~/utils/redis.server";

import { schema } from "./schema";

type TokenPayload = {
  email: string;
  tenant_id: string;
};

export const actionHandler = async (request: ActionFunctionArgs["request"]) => {
  await requireAnonymous(request);
  try {
    const formData = await request.formData();
    const submission = parseWithZod(formData, { schema: schema });

    if (submission.status !== "success") {
      return submission.reply();
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("Secret key environment variable not found.");
    }

    const verifiedToken = jwt.verify(
      submission.value.token,
      process.env.JWT_SECRET + "r353t",
    ) as TokenPayload;

    const user = await prisma.user.findFirst({
      include: {
        person: true,
      },
      where: {
        email: verifiedToken.email,
        deleted_at: null,
        person: {
          tenant_id: verifiedToken.tenant_id,
        },
      },
    });

    if (!user) {
      throw new BadRequestError("Bad Request", {
        title: "Gagal",
        description: "User tidak ditemukan.",
      });
    }

    const isValidToken = await redis.get(`${verifiedToken.email}-reset`);

    if (!isValidToken) {
      throw new BadRequestError("Bad Request", {
        title: "Gagal",
        description: "Token telah kadaluarsa.",
      });
    }

    const samePassword = await bcrypt.compare(
      submission.value.password,
      user.password,
    );

    if (samePassword) {
      throw new BadRequestError("Bad Request", {
        title: "Gagal",
        description: "Password tidak boleh sama",
      });
    }

    const hashedPassword = await bcrypt.hash(submission.value.password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    await redis.del(`${verifiedToken.email}-reset`);

    await logActivity({
      request,
      category: "System",
      action: "Reset password",
    });

    return redirectWithDialog(`/auth`, {
      type: "success",
      title: "Kata Sandi Baru Berhasil",
      description: "Kata sandi anda telah berhasil diubah.",
    });
  } catch (error) {
    let response: Response;
    let errorMessage = null;
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

    if (error instanceof Error) {
      errorMessage = error.message;
    }

    Sentry.captureException(
      errorMessage ?? new Error("Unknown error occurred"),
    );
    response = new Response(JSON.stringify(request), {
      headers: await createDialogHeaders({
        type: "error",
        title: "Terjadi Kesalahan",
        description: errorMessage ?? "Silah coba beberapa saat lagi",
        confirmText: "Coba Lagi",
      }),
    });

    return response;
  }
};
