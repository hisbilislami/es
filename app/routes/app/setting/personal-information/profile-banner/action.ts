import { parseWithZod } from "@conform-to/zod";
import { ActionFunctionArgs, data } from "@remix-run/node";
import * as Sentry from "@sentry/remix";

import { requireUserId } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { createDialogHeaders } from "~/utils/dialog.server";
import { BadRequestError } from "~/utils/error.server";
import { pathKeyToUrl } from "~/utils/file-uploads.server";
import { logActivity } from "~/utils/log-activity.server";

import { profilePhotoSchema } from "./constants";

async function updateProfilePhotoActionHandler(
  request: ActionFunctionArgs["request"],
) {
  try {
    const userId = await requireUserId(request);

    const formData = await request.formData();
    const submission = parseWithZod(formData, {
      schema: profilePhotoSchema,
    });

    if (submission.status !== "success") {
      throw new BadRequestError("Bad Request", {
        title: "Gagal Memerbarui Data",
        description: "Foto yang dipilih tidak valid",
      });
    }

    const [updatedProfile] = await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          profile_photo_id: +submission.value.photoProfileId,
        },
        select: {
          profile_photo: {
            select: {
              key: true,
            },
            where: { id: +submission.value.photoProfileId },
          },
        },
      }),
    ]);

    let profilePhotoUrl = "";
    if (updatedProfile.profile_photo?.key) {
      profilePhotoUrl = await pathKeyToUrl(
        updatedProfile.profile_photo?.key,
        60 * 60,
      );
    }

    await logActivity({
      request,
      category: "Informasi Pribadi",
      action: "update photo profile",
    });

    return data(
      {
        data: { profile_photo_url: profilePhotoUrl },
        success: true,
      },
      {
        headers: await createDialogHeaders({
          type: "success",
          title: "Pengubahan Berhasil",
          description: "Berhasil mengubah foto profil",
          confirmText: "OK",
        }),
      },
    );
  } catch (error) {
    let response: Response;
    Sentry.captureException(error);

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

export default updateProfilePhotoActionHandler;
