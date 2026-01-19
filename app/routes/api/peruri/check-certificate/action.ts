import { Prisma } from "@prisma/client";
import { ActionFunctionArgs, data } from "@remix-run/node";
import * as Sentry from "@sentry/remix";

import { requireUserId } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { createDialogHeaders } from "~/utils/dialog.server";
import { env } from "~/utils/env.server";
import { BadRequestError, InternalServerError } from "~/utils/error.server";
import { logActivity } from "~/utils/log-activity.server";
import { peruriBaseBodySchema } from "~/utils/peruri/constant";
import { peruriApiFetch } from "~/utils/peruri/peruri-service.server";
import { PeruriBaseBodySchema } from "~/utils/peruri/types";
import {
  getUserSession,
  USER_CRED,
  UserCredential,
} from "~/utils/session.server";

import { PeruriCertificateResponse } from "./constant";

export async function checkCertificate(
  body: PeruriBaseBodySchema,
  request: Request,
) {
  try {
    const res = await peruriApiFetch(
      "/digitalSignatureFullJwtSandbox/1.0/checkCertificate/v1",
      {
        body: JSON.stringify({
          param: body,
        }),
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      },
      request,
    );

    return res;
  } catch (error) {
    if (error instanceof Error) {
      throw new InternalServerError("Internal Server Error", {
        title: "Terjadi Kesalahan",
        description: error.message,
      });
    }
  }
}

const actionHandler = async ({ request }: ActionFunctionArgs) => {
  try {
    const userId = await requireUserId(request);
    const session = await getUserSession(request);
    const userCredential = (await session.get(USER_CRED)) as UserCredential;
    const { PERURI_SYSTEM_ID } = env();

    const submission = peruriBaseBodySchema.safeParse({
      email: userCredential.email,
      systemId: PERURI_SYSTEM_ID,
    });

    if (!submission.success) {
      throw new BadRequestError("Bad Request", {
        title: "Gagal",
        description: "Pastikan data yang digunakan sudah sesuai",
      });
    }

    const userCA = (await checkCertificate(
      submission.data,
      request,
    )) as PeruriCertificateResponse;

    if (userCA?.resultCode !== "0") {
      throw new InternalServerError("Internal Server Error", {
        title: "Terjadi Kesalahan",
        description: userCA?.resultDesc as string,
      });
    }

    let caStatus = "";
    const caExpireDate = new Date();

    if (userCA?.data?.isExpired === "0") {
      caStatus = "valid";
      caExpireDate.setDate(
        caExpireDate.getDate() + 30 + Math.floor(Math.random() * 30) + 1,
      );
    }

    if (userCA?.data?.isExpired === "1") {
      caStatus = "almost_expired";
      caExpireDate.setDate(
        caExpireDate.getDate() + Math.floor(Math.random() * 30) + 1,
      );
    }

    if (userCA?.data?.isExpired === "2") {
      caStatus = "expired";
      caExpireDate.setDate(caExpireDate.getDate() - 1);
    }

    const certificateData: Prisma.CertificatePeruriCreateInput = {
      user_has_certificate: {
        connect: {
          id: userId,
        },
      },
      issues_date: new Date(),
      expiry_date: caExpireDate,
      status: caStatus,
      last_checked_at: new Date(),
    };

    await prisma.$transaction(async (tx) => {
      const caCurrentData = await tx.certificatePeruri.findFirst({
        where: { user_id: userId },
      });

      if (caCurrentData) {
        tx.certificatePeruri.update({
          where: { id: Number(caCurrentData.id) },
          data: certificateData,
        });
      }

      tx.certificatePeruri.create({
        data: certificateData,
      });
    });

    await logActivity({
      request,
      category: "Sinkronisasi Peruri",
      action: "Check certificate peruri",
    });

    return data({ success: true, data: submission.data });
  } catch (error) {
    let options: ResponseInit = {};
    let message = "Terjadi Kesalahan";

    if (error instanceof Error) {
      Sentry.captureException(error.stack);
    }

    if (
      error instanceof BadRequestError ||
      error instanceof InternalServerError
    ) {
      Sentry.captureException(error);
      message = error.details.description;
      options = {
        status: error.status,
        headers: await createDialogHeaders({
          ...error.details,
          type: "error",
          confirmText: "Coba Lagi",
        }),
      };
    }

    return data({ success: false, message }, options);
  }
};

export default actionHandler;
