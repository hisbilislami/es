import { ActionFunctionArgs, data } from "@remix-run/node";
import * as Sentry from "@sentry/remix";

import { requireUserId } from "~/utils/auth.server";
import { formatDate } from "~/utils/dates";
import { prisma } from "~/utils/db.server";
import { createDialogHeaders } from "~/utils/dialog.server";
import { env } from "~/utils/env.server";
import { BadRequestError, InternalServerError } from "~/utils/error.server";
import { pathKeyToUrl } from "~/utils/file-uploads.server";
import { logActivity } from "~/utils/log-activity.server";
import { peruriApiFetch } from "~/utils/peruri/peruri-service.server";
import {
  getUserSession,
  USER_CRED,
  UserCredential,
} from "~/utils/session.server";
import { getBase64FromUrl, removeMimeFromBase64 } from "~/utils/string-helper";

import {
  PeruriRegisterUser,
  peruriRegisterUserSchema,
  UserType,
} from "./constants";

export async function registerUser(body: PeruriRegisterUser, request: Request) {
  try {
    const res = await peruriApiFetch(
      "/digitalSignatureFullJwtSandbox/1.0/registration/v1",
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
      Sentry.captureException(error.stack);
      throw new Error(`Something went wrong: ${error.message}`);
    }
    throw new Error("Something went wrong");
  }
}

const actionHandler = async ({ request }: ActionFunctionArgs) => {
  try {
    const userId = await requireUserId(request);
    const session = await getUserSession(request);
    const userCredential = (await session.get(USER_CRED)) as UserCredential;
    const { PERURI_SYSTEM_ID } = env();

    const [personDetail] = await prisma.$transaction([
      // prisma.$queryRawTyped(getPersonInformation(userCredential.personId)),
      prisma.person.findUnique({
        where: { id: +userCredential.personId },
        select: {
          name: true,
          phone_number: true,
          nik: true,
          ktp_files: {
            select: { key: true },
          },
          npwp: true,
          npwp_files: {
            select: { key: true },
          },
          address: true,
          city: {
            select: {
              name: true,
              id: true,
            },
          },
          province: {
            select: {
              name: true,
              id: true,
            },
          },
          place_of_birth: true,
          date_of_birth: true,
          gender: true,
          organization_unit: true,
          work_unit: true,
          occupation: true,
        },
      }),
    ]);
    const currentPersonInfo = { ...personDetail, ktpPhoto: "", npwpPhoto: "" };

    if (currentPersonInfo.ktp_files?.key) {
      const ktpUrl = await pathKeyToUrl(
        currentPersonInfo.ktp_files.key,
        60 * 60 * 60,
      );

      const base64Ktp = await getBase64FromUrl(ktpUrl);

      currentPersonInfo.ktpPhoto = removeMimeFromBase64(base64Ktp);
    }

    if (currentPersonInfo.npwp_files?.key) {
      const npwpUrl = await pathKeyToUrl(
        currentPersonInfo.npwp_files?.key,
        60 * 60 * 60,
      );

      const base64Npwp = await getBase64FromUrl(npwpUrl);

      currentPersonInfo.npwpPhoto = removeMimeFromBase64(base64Npwp);
    }

    const submission = peruriRegisterUserSchema.safeParse({
      name: currentPersonInfo.name,
      phone: currentPersonInfo.phone_number,
      type: UserType.INDIVIDUAL,
      ktp: currentPersonInfo.nik,
      ktpPhoto: currentPersonInfo.ktpPhoto,
      npwp: currentPersonInfo.npwp,
      npwpPhoto: currentPersonInfo.npwpPhoto,
      address: currentPersonInfo.address,
      city: currentPersonInfo.city?.name,
      province: currentPersonInfo.province?.name,
      gender: currentPersonInfo.gender,
      placeOfBirth: currentPersonInfo.place_of_birth,
      dateOfBirth: formatDate(
        currentPersonInfo.date_of_birth as Date,
        "DD/MM/YYYY",
      ),
      orgUnit: currentPersonInfo.organization_unit,
      workUnit: currentPersonInfo.work_unit,
      position: currentPersonInfo.occupation,
      email: userCredential.email,
      systemId: PERURI_SYSTEM_ID,
    });

    if (!submission.success) {
      throw new BadRequestError("Bad Request", {
        title: "Gagal",
        description: "Pastikan data yang digunakan sudah sesuai",
      });
    }

    const resRegisterUser = await registerUser(submission.data, request);

    if (resRegisterUser.resultCode !== "0") {
      throw new InternalServerError("Internal Server Error", {
        title: "Terjadi Kesalahan",
        description: resRegisterUser.resultDesc,
      });
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: +userId },
        data: {
          sync_with_peruri: true,
        },
      }),
    ]);

    await logActivity({
      request,
      category: "Sinkronisasi Peruri",
      action: "Sinkronisasi ke peruri",
    });

    return new Response(JSON.stringify(submission.data), {
      headers: await createDialogHeaders({
        title: "Registrasi Peruri",
        type: "success",
        description: "Registrasi Peruri berhasil.",
      }),
    });
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
        status: 400,
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
