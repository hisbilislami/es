import {
  data,
  unstable_parseMultipartFormData,
  unstable_createMemoryUploadHandler,
} from "@remix-run/node";
import mime from "mime-types";

import { getUserId, requireUserId } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { createDialogHeaders } from "~/utils/dialog.server";
import { storeFile, UploadType } from "~/utils/file-uploads.server";
import { getTenantId } from "~/utils/session.server";

export const action = async ({ request }: { request: Request }) => {
  try {
    await requireUserId(request);
    const userId = await getUserId(request);
    if (!userId) throw new Error("Unauthorized");

    const tenant = await getTenantId(request);
    if (!tenant.tenantId) throw new Error("Unauthorized");

    const uploadHandler = unstable_createMemoryUploadHandler({
      maxPartSize: 10_000_000, // 10MB
    });

    const formData = await unstable_parseMultipartFormData(
      request,
      uploadHandler,
    );

    const file = formData.get("file") as File | null;

    if (!file) {
      throw new Error("Missing file or profile type");
    }

    const mimeType = mime.lookup(file.name);
    const ext = mime.extension(file.type);

    if (!mimeType || !ext) {
      throw new Error(`cannot read file`);
    }

    const fileUrl = await storeFile(
      file,
      UploadType.IMAGE,
      tenant.tenantId,
      userId,
    );

    const storedFile = await prisma.files.create({
      data: {
        key: fileUrl.filename,
        size: file.size,
        extension: ext,
        origin_name: file.name,
        mime_type: mimeType,
      },
    });

    return data({
      success: true,
      data: {
        id: storedFile.id,
        key: storedFile.key,
      },
    });
  } catch (error) {
    return data(
      { success: false, data: null },
      {
        headers: await createDialogHeaders({
          type: "error",
          title: "Terjadi Kesalahan",
          description: error.message as string,
          confirmText: "Coba Lagi",
        }),
      },
    );
  }
};
