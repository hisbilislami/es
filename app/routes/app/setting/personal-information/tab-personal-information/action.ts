import { parseWithZod } from "@conform-to/zod";
import { ActionFunctionArgs } from "@remix-run/node";
import * as Sentry from "@sentry/remix";

import { requireUserId } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { createDialogHeaders, redirectWithDialog } from "~/utils/dialog.server";
import { BadRequestError } from "~/utils/error.server";
import { logActivity } from "~/utils/log-activity.server";
import {
  getUserSession,
  USER_CRED,
  UserCredential,
} from "~/utils/session.server";

import { personalInformationFormSchema } from "./constants";

async function personalInformationActionHandler(
  request: ActionFunctionArgs["request"],
) {
  try {
    const userId = await requireUserId(request);
    const session = await getUserSession(request);
    const userCredential = (await session.get(USER_CRED)) as UserCredential;

    const formData = await request.formData();
    const submission = parseWithZod(formData, {
      schema: personalInformationFormSchema,
    });

    if (submission.status !== "success") {
      return submission.reply();
    }

    await prisma.$transaction([
      prisma.person.update({
        where: { id: userCredential.personId },
        data: {
          name: submission.value.name,
          gender: submission.value.gender,
          medical_record_number: submission.value.medicalRecordNumber,
          employee_number: submission.value.employeeNumber,
          nik: submission.value.ktpNumber,
          ktp_file_id: submission.value?.ktpFileId
            ? +submission.value.ktpFileId
            : undefined,
          npwp: submission.value.npwpNumber,
          npwp_file_id: submission.value.npwpFileId
            ? +submission.value.npwpFileId
            : undefined,
          organization_unit: submission.value.organizationUnit,
          work_unit: submission.value.workUnit,
          occupation: submission.value.occupation,
          phone_number: submission.value.phoneNumber,
          address: submission.value.address,
          city_id: +submission.value.city,
          province_id: +submission.value.province,
          place_of_birth: submission.value.placeOfBirth,
          date_of_birth: submission.value.dateOfBirth,
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          role_id: submission.value.privileges
            ? Number(submission.value.privileges)
            : null,
        },
      }),
    ]);

    await logActivity({
      request,
      category: "Informasi Pribadi",
      action: "Update data pribadi",
    });

    return redirectWithDialog(`/app/setting/personal-information`, {
      title: "Berhasil",
      type: "success",
      description: "Berhasil mengubah data profile",
      confirmText: "OK",
    });
  } catch (error) {
    let response: Response;
    if (error instanceof BadRequestError) {
      Sentry.captureException(error);
      response = new Response(JSON.stringify(request), {
        headers: await createDialogHeaders({
          ...error.details,
          type: "error",
          confirmText: "Coba Lagi",
        }),
      });

      return response;
    }

    if (error instanceof Error) {
      Sentry.captureException(error.stack);
      response = new Response(JSON.stringify(request), {
        headers: await createDialogHeaders({
          type: "error",
          title: "Terjadi Kesalahan",
          description: error.message,
          confirmText: "Coba Lagi",
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
}

export default personalInformationActionHandler;
