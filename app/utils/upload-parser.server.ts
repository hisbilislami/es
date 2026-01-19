import {
  unstable_parseMultipartFormData,
  unstable_createMemoryUploadHandler,
} from "@remix-run/node";

import { getUserId, requireUserId } from "./auth.server";
import { getTenantId } from "./session.server";

export async function parseUpload(request: Request) {
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
    throw new Error("Missing file");
  }

  return file;
}
