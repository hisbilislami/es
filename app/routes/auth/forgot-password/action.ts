import { parseWithZod } from "@conform-to/zod";
import { ActionFunctionArgs } from "@remix-run/node";
import * as Sentry from "@sentry/remix";
import jwt from "jsonwebtoken";

import { qSendEmail } from "~/task/send-email.server";
import { requireAnonymous } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { createDialogHeaders } from "~/utils/dialog.server";
import { BadRequestError } from "~/utils/error.server";
import redis from "~/utils/redis.server";

import { schema } from "./schema";

export const actionHandler = async (request: ActionFunctionArgs["request"]) => {
  await requireAnonymous(request);

  try {
    const formData = await request.formData();

    const submission = parseWithZod(formData, { schema: schema });

    if (submission.status !== "success") {
      return submission.reply();
    }

    const { email } = submission.value;

    const user = await prisma.user.findFirst({
      include: {
        person: true,
      },
      where: {
        email: email,
        deleted_at: null,
      },
    });

    if (!user) {
      throw new BadRequestError("Bad Request", {
        title: "Gagal",
        description: "User tidak ditemukan.",
      });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("Secret key environment variable not found.");
    }

    const token = jwt.sign(
      {
        email: user.email,
        tenant_id: user.person.tenant_id,
      },
      process.env.JWT_SECRET + "r353t",
      {
        expiresIn: "1h",
        algorithm: "HS256",
      },
    );

    const baseUrl = new URL(request.url).origin;

    const resetLink = `${baseUrl}/auth/reset-password?token=${token}`;
    const tokenExpiration = 1800; // 1h

    await redis.set(`${user.email}-reset`, token, "EX", tokenExpiration);

    // send email
    await qSendEmail.add("send-email", {
      email: user.email,
      username: user.username,
      resetLink: resetLink,
    });

    return new Response(JSON.stringify({ status: "success" }), {
      headers: await createDialogHeaders({
        title: "Reset Password",
        icon: "/image/alert-feedback.svg",
        description: "Link atur ulang kata sandi terkirim ke email.",
      }),
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
        description: "Silah coba beberapa saat lagi",
        confirmText: "Coba Lagi",
      }),
    });

    return response;
  }
};
