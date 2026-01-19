import { Prisma } from "@prisma/client";
import { ActionFunctionArgs, data } from "@remix-run/node";
import * as Sentry from "@sentry/remix";

import { requireUserId } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { createDialogHeaders } from "~/utils/dialog.server";
import { env } from "~/utils/env.server";
import { BadRequestError, InternalServerError } from "~/utils/error.server";
import { logActivity } from "~/utils/log-activity.server";
import { peruriApiFetch } from "~/utils/peruri/peruri-service.server";
import {
  getUserSession,
  USER_CRED,
  UserCredential,
} from "~/utils/session.server";
import { removeMimeFromBase64 } from "~/utils/string-helper";

import { PeruriVerifyKyc, peruriVerifyKycSchema } from "./constants";

export async function verifyVideoKyc(
  body: Omit<PeruriVerifyKyc, "action">,
  request: Request,
) {
  try {
    const res = await peruriApiFetch(
      "/digitalSignatureFullJwtSandbox/1.0/videoVerification/v1",
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

export async function renewalVideoKyc(
  body: Omit<PeruriVerifyKyc, "action">,
  request: Request,
) {
  try {
    const res = await peruriApiFetch(
      "/digitalSignatureFullJwtSandbox/1.0/videoVerificationForRenewal/v1",
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

    const formData = await request.formData();

    const submission = peruriVerifyKycSchema.safeParse({
      videoStream: removeMimeFromBase64(formData.get("videoStream") as string),
      email: userCredential.email,
      systemId: PERURI_SYSTEM_ID,
      action: formData.get("action") as string,
    });

    if (!submission.success) {
      throw new BadRequestError("Bad Request", {
        title: "Gagal",
        description: "Pastikan data yang digunakan sudah sesuai",
      });
    }

    const { action } = submission.data;

    // 📡 Call Peruri API
    const resRegisterUser =
      action === "verify"
        ? await verifyVideoKyc(submission.data, request)
        : await renewalVideoKyc(submission.data, request);

    if (resRegisterUser?.resultCode === "1040") {
      return data(
        { success: true, data: submission.data },
        {
          headers: await createDialogHeaders({
            title: resRegisterUser.resultDesc,
            description: "Video KYC anda akan diverifikasi terlebih dahulu.",
            type: "info",
            confirmText: "OK",
          }),
        },
      );
    }
    if (resRegisterUser?.resultCode !== "0") {
      throw new InternalServerError("Internal Server Error", {
        title: "Terjadi Kesalahan",
        description: resRegisterUser?.resultDesc as string,
      });
    }

    await prisma.user.update({
      where: { id: +userId },
      data: { kyc_verified: true },
    });

    if (action === "renewal") {
      const caExpireDate = new Date();
      caExpireDate.setDate(
        caExpireDate.getDate() + 30 + Math.floor(Math.random() * 30) + 1,
      );
      const certificateData: Prisma.CertificatePeruriCreateInput = {
        user_has_certificate: {
          connect: {
            id: userId,
          },
        },
        issues_date: new Date(),
        expiry_date: caExpireDate,
        status: "valid",
        last_checked_at: new Date(),
      };

      await prisma.$transaction(async (tx) => {
        const existing = await tx.certificatePeruri.findFirst({
          where: { user_id: userId },
        });

        if (existing) {
          await tx.certificatePeruri.update({
            where: { id: existing.id },
            data: certificateData,
          });
        }
      });
    }

    await logActivity({
      request,
      category: "Sinkronisasi Peruri",
      action: action === "verify" ? "Verifikasi E-KYC" : "Renewal E-KYC",
    });

    return data({ success: true, data: submission.data.systemId });
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
