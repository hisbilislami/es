import { createCookieSessionStorage, data, redirect } from "@remix-run/node";
import * as Sentry from "@sentry/remix";

import { createDialogHeaders } from "./dialog.server";
import { env } from "./env.server";
import { combineHeaders } from "./http";
import { logActivity } from "./log-activity.server";
import { destroyPeruriToken } from "./peruri/peruri-service.server";
import redis from "./redis.server";

const { SESSION_SECRET, SESSION_TTL, TENANT_ID, HIS_PROXY_TARGET } = env();
export const authSessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: [SESSION_SECRET],
    secure: process.env.NODE_ENV === "production",
  },
});

export const formSessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__form_session",
    secrets: [SESSION_SECRET],
    sameSite: "lax",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  },
});

export const registrationSessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__otp_session",
    secrets: [SESSION_SECRET],
    sameSite: "lax",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  },
});

export const USER_CRED = "userCredential";
export const USER_ID = "userId";
export const USER_TENANT = "userTenant";

export async function getUserSession(request: Request) {
  const cookie = request.headers.get("Cookie");
  return authSessionStorage.getSession(cookie);
}

export type UserCredential = {
  email: string;
  username: string;
  personId: number;
};

export async function createUserSession({
  request,
  redirectTo,
  userId,
  userCred,
  shouldRemember,
  headers,
}: {
  request: Request;
  redirectTo: string;
  userId: number;
  userCred: UserCredential;
  shouldRemember: boolean;
  headers?: Headers;
}) {
  const session = await getUserSession(request);
  session.set(USER_CRED, userCred);
  session.set(USER_ID, userId);

  const tenant = await getTenantId(request);
  session.set(USER_TENANT, tenant);

  const sessionTtl = shouldRemember ? 14 : parseInt(SESSION_TTL || "7");

  await setRedisUserSession(
    userCred.username,
    { ...userCred, id: userId, ...tenant },
    sessionTtl,
  );

  await logActivity({
    request,
    action: "login",
    category: "System",
    user: {
      user_id: userId,
      tenant_id: tenant.tenantId,
    },
  });

  return redirect(redirectTo, {
    headers: combineHeaders(
      {
        "set-cookie": await authSessionStorage.commitSession(session, {
          maxAge: 60 * 60 * 24 * sessionTtl,
        }),
      },
      headers,
    ),
  });
}

export async function logout(request: Request) {
  try {
    const session = await getUserSession(request);

    const { username } = session.get(USER_CRED);
    await deleteRedisUserSession(username);
    await destroyPeruriToken(request);

    await logActivity({
      request: request,
      action: "logout",
      category: "System",
    });
    return redirect("/auth", {
      headers: combineHeaders({
        "Set-Cookie": await authSessionStorage.destroySession(session),
      }),
    });
  } catch (error) {
    if (error instanceof Error) {
      Sentry.captureException(error);
    }

    return data(
      {
        success: false,
      },
      {
        headers: await createDialogHeaders({
          type: "error",
          title: "Terjadi Kesalahan",
          description: "Silah coba beberapa saat lagi",
          confirmText: "Coba Lagi",
        }),
      },
    );
  }
}

/**
 * Return tenant id given request
 * @param request Request from browser
 * @returns string
 */
export const getTenantId = async (request: Request) => {
  // handle on-premise env
  if (
    (HIS_PROXY_TARGET === undefined && TENANT_ID !== undefined) ||
    (HIS_PROXY_TARGET !== undefined && TENANT_ID === undefined)
  ) {
    throw new Error(
      "On-prem environment detected. both HIS_PROXY_TARGET and TENANT_ID must be set",
    );
  }
  if (TENANT_ID) {
    return {
      tenantId: TENANT_ID,
      hisProxy: HIS_PROXY_TARGET as string,
    };
  }

  // handle cloud
  const { hostname } = new URL(request.url);
  const tenantId = hostname.split(".")[0];

  return {
    tenantId: tenantId,
    hisProxy: `https://${tenantId}.trustmedis.net`,
  };
};

export async function setRedisUserSession(
  username: string,
  payload: Record<string, number | string>,
  ttl: number,
) {
  await redis.set(
    `session:${username}`,
    JSON.stringify(payload),
    "EX",
    60 * 60 * 24 * ttl,
  ); // Expires in 7 days by default
}

export async function getRedisUserSession(username: string) {
  return await redis.get(`session:${username}`);
}

export async function deleteRedisUserSession(username: string) {
  await redis.del(`session:${username}`);
}
