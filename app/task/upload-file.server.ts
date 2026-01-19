import mime from "mime-types";

import { prisma } from "~/utils/db.server";
import { storeFile, UploadType } from "~/utils/file-uploads.server";
import { Queue } from "~/utils/queue.server";

type QueueData = {
  buffer: Buffer;
  name: string;
  type: string;
  size: number;
  userId: string;
  tenantId: string;
};

export const qUploadFile = Queue<QueueData>("upload-file", async (job) => {
  const { buffer, name, type, size, userId, tenantId } = job.data;
  const mimeType = mime.lookup(name);
  const ext = mime.extension(type);

  if (!mimeType || !ext) {
    throw new Error(`Invalid file type for ${name}`);
  }

  // Reconstruct the file as a Blob/File
  const file = new File([buffer], name, { type });

  const fileUrl = await storeFile(file, UploadType.IMAGE, tenantId, userId);

  const storedFile = await prisma.files.create({
    data: {
      key: fileUrl.filename,
      size,
      extension: ext,
      origin_name: name,
      mime_type: mimeType,
    },
  });

  return {
    id: storedFile.id,
    key: storedFile.key,
  };
});
