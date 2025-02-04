import { createCookieSessionStorage } from "@remix-run/node";
import { invariant } from "@epic-web/invariant";

import { redirectWithToast } from "~/utils/toast.server";

invariant(process.env.SESSION_SECRET!, "SESSION_SECRET must be set");
invariant(process.env.SESSION_TTL!, "SESSION_TTL must be set");

export const authSessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: [process.env.SESSION_SECRET],
    secure: process.env.NODE_ENV === "production",
  },
});

export const USER_CRED = "userCredential";
export const USER_ID = "employeeId";

export async function getSession(request: Request) {
  const cookie = request.headers.get("Cookie");
  return authSessionStorage.getSession(cookie);
}

export async function createUserSession({
  request,
  redirectTo,
  userId,
  userCred,
}: {
  request: Request;
  redirectTo: string;
  userId: number | null;
  userCred: Record<"email" | "username", string>;
}) {
  const session = await getSession(request);
  session.set(USER_CRED, userCred);
  session.set(USER_ID, userId);

  const sessionTtl = parseInt(process.env.SESSION_TTL || "60");

  throw await redirectWithToast(
    redirectTo,
    {
      title: "Login success",
      description: "You have been logged in successfully",
      type: "success",
    },
    {
      headers: {
        "set-cookie": await authSessionStorage.commitSession(session, {
          maxAge: 60 * sessionTtl,
        }),
      },
    }
  );
}
