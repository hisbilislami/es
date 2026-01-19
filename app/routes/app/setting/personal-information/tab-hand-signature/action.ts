import { parseWithZod } from "@conform-to/zod";
import * as Sentry from "@sentry/remix";
import {
  data,
  unstable_parseMultipartFormData,
  unstable_createMemoryUploadHandler,
  ActionFunctionArgs,
} from "@remix-run/node";
import * as Sentry from "@sentry/remix";
import mime from "mime-types";

import sendSpeciment from "~/routes/api/peruri/send-speciment/send-speciment";
import { getUserId, requireUserId } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { createDialogHeaders } from "~/utils/dialog.server";
import { env } from "~/utils/env.server";
import { storeFile, UploadType } from "~/utils/file-uploads.server";
import {
  getUserSession,
  getTenantId,
  USER_CRED,
  UserCredential,
} from "~/utils/session.server";
import {
  convertBase64ToFile,
  removeMimeFromBase64,
} from "~/utils/string-helper";

import { handSignatureFormSchema } from "./constant";
import { logActivity } from "~/utils/log-activity.server";

const handSignatureActionHandler = async (
  request: ActionFunctionArgs["request"],
) => {
  try {
    await requireUserId(request);
    const userId = await getUserId(request);
    if (!userId) throw new Error("Unauthorized");

    const tenant = await getTenantId(request);
    if (!tenant.tenantId) throw new Error("Unauthorized");

    const session = await getUserSession(request);
    const userCredential = session.get(USER_CRED) as UserCredential;

    const uploadHandler = unstable_createMemoryUploadHandler({
      maxPartSize: 10_000_000, // 10MB
    });

    const formData = await unstable_parseMultipartFormData(
      request,
      uploadHandler,
    );

    const submission = parseWithZod(formData, {
      schema: handSignatureFormSchema,
    });

    if (submission.status !== "success") {
      return submission.reply();
    }

    const { PERURI_SYSTEM_ID } = env();
    const speciment = removeMimeFromBase64(submission.value.fileBase64);
    const specimentResponse = await sendSpeciment(
      {
        email: userCredential.email,
        speciment,
        systemId: PERURI_SYSTEM_ID,
      },

      request,
    );

    if (specimentResponse.resultCode !== "0") {
      throw new Error(specimentResponse.resultDesc);
    }

    let signatureFile: File | undefined;
    signatureFile = submission.value.fileObject;

    if (!signatureFile) {
      const { file: fileTransformFromBase64 } = convertBase64ToFile({
        base64: submission.value.fileBase64,
        prefixName: "signature",
      });
      signatureFile = fileTransformFromBase64;
    }

    const mimeType = mime.lookup(signatureFile.name);
    const ext = mime.extension(signatureFile.type);

    if (!mimeType || !ext) {
      throw new Error(`cannot read file`);
    }

    const fileUrl = await storeFile(
      signatureFile,
      UploadType.IMAGE,
      tenant.tenantId,
      userId,
    );

    const storedFile = await prisma.files.create({
      data: {
        key: fileUrl.filename,
        size: signatureFile.size,
        extension: ext,
        origin_name: signatureFile.name,
        mime_type: mimeType,
      },
    });

    const [updatedProfile] = await prisma.$transaction([
      prisma.person.update({
        where: { id: userCredential.personId },
        data: {
          sign_id: storedFile.id,
          sign_sync_to_peruri: true,
        },
        select: {
          sign_sync_to_peruri: true,
        },
      }),
    ]);

    await logActivity({
      request,
      category: "Informasi Pribadi",
      action: "Update tanda tangan",
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          signSyncToPeruri: updatedProfile.sign_sync_to_peruri,
        },
      }),
      {
        headers: await createDialogHeaders({
          title: "Pembaruan Berhasil",
          description: "Berhasil memperbarui data tanda tangan digital",
          type: "success",
        }),
      },
    );
  } catch (error) {
    Sentry.captureException(error);
    return new Response(
      JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
        data: null,
      }),
      {
        headers: await createDialogHeaders({
          title: "Terjadi Kesalahan",
          description: error instanceof Error ? error.message : "Unknown error",
          confirmText: "Coba Lagi",
          type: "error",
        }),
      },
    );
  }
};

export default handSignatureActionHandler;
