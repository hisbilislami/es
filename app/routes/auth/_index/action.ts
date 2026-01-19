import { parseWithZod } from "@conform-to/zod";
import { ActionFunctionArgs } from "@remix-run/node";
import bcrypt from "bcryptjs";

import { requireAnonymous } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { createDialogHeaders } from "~/utils/dialog.server";
import { BadRequestError } from "~/utils/error.server";
import { fetchPeruriToken } from "~/utils/peruri/peruri-service.server";
import { createUserSession } from "~/utils/session.server";

import { loginFormSchema } from "./schema";

async function actionHandler(request: ActionFunctionArgs["request"]) {
  await requireAnonymous(request);
  const formData = await request.formData();

  try {
    const submission = parseWithZod(formData, { schema: loginFormSchema });

    if (submission.status !== "success") {
      return submission.reply();
    }

    const userWithPassword = await prisma.user.findUnique({
      include: {
        person: true,
      },
      where: { username: submission.value.username },
    });

    if (!userWithPassword?.email_verified) {
      throw new BadRequestError("Bad Request", {
        title: "Gagal Masuk",
        description: "Pastikan email ada sudah terverifikasi",
      });
    }

    if (!userWithPassword || !userWithPassword.password) {
      throw new BadRequestError("Bad Request", {
        title: "Gagal Masuk",
        description: "Username dan kata sandi tidak sesuai",
      });
    }

    const isValid = await bcrypt.compare(
      submission.value.password,
      userWithPassword.password,
    );

    if (!isValid) {
      throw new BadRequestError("Bad Request", {
        title: "Gagal Masuk",
        description: "Username dan kata sandi tidak sesuai",
      });
    }

    await fetchPeruriToken(userWithPassword.username);

    const userSession = await createUserSession({
      request,
      redirectTo: "/app",
      userId: userWithPassword.id,
      userCred: {
        personId: userWithPassword.person_id,
        username: userWithPassword.username,
        email: userWithPassword.person.email as string,
      },
      shouldRemember: submission.value.remember_me,
    });

    return userSession;
  } catch (error) {
    let response: Response;
    if (error instanceof BadRequestError) {
      response = new Response(JSON.stringify(request), {
        headers: await createDialogHeaders({
          ...error.details,
          type: "error",
          confirmText: "Coba Lagi",
        }),
      });

      return response;
    }

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
