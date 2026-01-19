import * as Sentry from "@sentry/remix";

import { prisma } from "./db.server";
import { authSessionStorage, getTenantId, USER_ID } from "./session.server";

interface LogActivityParams {
  request: Request;
  category: string;
  action: string;
}

const getUserSession = async (request: Request) => {
  const authSession = await authSessionStorage.getSession(
    request.headers.get("cookie"),
  );

  const userId = authSession.get(USER_ID);

  const tenant = await getTenantId(request);

  if (!userId || !tenant) {
    return false;
  }

  const tenantId = tenant.tenantId;

  return {
    user_id: userId,
    tenant_id: tenantId,
  };
};

export const logActivity = async ({
  request,
  action,
  category,
  user,
}: LogActivityParams & { user?: { user_id: number; tenant_id: string } }) => {
  try {
    const sessionUser = user || (await getUserSession(request));
    if (!sessionUser) {
      throw new Error("User must be logged in to log activity");
    }

    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      request.headers.get("remote_addr") ||
      "unknown or local";

    console.info(
      "----------------------------------------------------------------",
    );
    console.info(
      `Recording ${action.toUpperCase()} activity of User with ID ${sessionUser.user_id}`,
    );
    console.info(
      "----------------------------------------------------------------",
    );

    return prisma.activityLog.create({
      data: {
        user_id: sessionUser.user_id,
        tenant_id: sessionUser.tenant_id,
        ip_address: ipAddress,
        action,
        category,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      Sentry.captureException(error);
      console.warn(
        "----------------------------------------------------------------",
      );
      console.warn(error.message);
      console.warn(
        "----------------------------------------------------------------",
      );

      return false;
    }

    Sentry.captureException(new Error("Unknown error occurred"));
    console.warn(
      "----------------------------------------------------------------",
    );
    console.warn("Log activity: unknown error");
    console.warn(
      "----------------------------------------------------------------",
    );

    return false;
  }
};
