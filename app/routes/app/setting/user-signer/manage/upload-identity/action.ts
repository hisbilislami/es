import { parseWithZod } from "@conform-to/zod";
import { ActionFunctionArgs, data } from "@remix-run/node";
import * as Sentry from "@sentry/remix";

import { requireUserId } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { createDialogHeaders } from "~/utils/dialog.server";
import { BadRequestError } from "~/utils/error.server";
import { pathKeyToUrl } from "~/utils/file-uploads.server";
import { logActivity } from "~/utils/log-activity.server";

import { identityFileSchema } from "../schema/identity-upload.schema";

async function updateIdentityFileActionHandler(
  request: ActionFunctionArgs["request"],
) {
  try {
    await requireUserId(request);

    const formData = await request.formData();
    const submission = parseWithZod(formData, {
      schema: identityFileSchema,
    });

    if (submission.status !== "success") {
      throw new BadRequestError("Bad Request", {
        title: "Gagal Memerbarui Data",
        description: "Gambar yang dipilih tidak valid",
      });
    }

    const id = submission.value?.id;

    const [updatedIdentityFile] = await prisma.$transaction([
      prisma.personIdentity.update({
        where: { id: Number(id) },
        data: {
          file_identity_id: +submission.value.identity_file_id,
        },
        select: {
          file_identity: {
            select: {
              key: true,
            },
            where: { id: +submission.value.identity_file_id },
          },
        },
      }),
    ]);

    let identityFileUrl = "";
    if (updatedIdentityFile.file_identity?.key) {
      identityFileUrl = await pathKeyToUrl(
        updatedIdentityFile.file_identity?.key,
        60 * 60,
      );
    }

    await logActivity({
      request,
      category: "Identitas User Signer",
      action: "update file identitas",
    });

    return data(
      {
        data: { identity_file_url: identityFileUrl },
        success: true,
      },
      {
        headers: await createDialogHeaders({
          type: "success",
          title: "Pengubahan Berhasil",
          description: "Berhasil mengunggah foto identitas",
          confirmText: "Oke",
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

export default updateIdentityFileActionHandler;
