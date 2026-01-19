import { redirect } from "@remix-run/node";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import * as Sentry from "@sentry/remix";

import { authSessionStorage, USER_ID } from "./session.server";
import {
  BadRequestError,
  InternalServerError,
  UnauthorizedError,
} from "./error.server";
import { prisma } from "./db.server";

interface JWTPayload {
  clientId?: string;
  apiKey?: string;
  iat?: number;
  exp?: number;
}

export async function getPasswordHash(password: string) {
  const hash = await bcrypt.hash(password, 16);
  return hash;
}

export async function getUserId(request: Request) {
  const authSession = await authSessionStorage.getSession(
    request.headers.get("cookie"),
  );
  const userId = authSession.get(USER_ID);
  if (!userId && !request.url.includes("auth")) {
    throw redirect("/", {
      headers: {
        "set-cookie": await authSessionStorage.destroySession(authSession),
      },
    });
  }
  return userId;
}

export async function requireUserId(
  request: Request,
  { redirectTo }: { redirectTo?: string | null } = {},
) {
  const userId = await getUserId(request);
  if (!userId) {
    const requestUrl = new URL(request.url);
    redirectTo =
      redirectTo === null
        ? null
        : (redirectTo ?? `${requestUrl.pathname}${requestUrl.search}`);
    const loginParams = redirectTo ? new URLSearchParams({ redirectTo }) : null;
    const loginRedirect = ["/auth", loginParams?.toString()]
      .filter(Boolean)
      .join("?");
    throw redirect(loginRedirect);
  }
  return userId;
}

export async function requireAnonymous(request: Request) {
  const userId = await getUserId(request);
  if (userId) {
    throw redirect("/app");
  }
}

export async function generateJwtToken(payload: {
  clientId: string;
  apiKey: string;
}): Promise<string> {
  if (!process.env.JWT_SECRET) {
    throw new Error("Secret key environment variable not found.");
  }
  try {
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
      algorithm: "HS256",
    });
    return token;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to generate JWT token.");
  }
}

export const verifyJwtToken = async (token: string) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("secret key not found.");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("JWT verification failed.");
  }
};

export const authenticateClientRequest = async (request: Request) => {
  const authHeader = request.headers.get("Authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    const error = new BadRequestError("Bad Request", {
      title: "Invalid Header",
      description: "Missing or invalid Authorization header",
    });
    throw new Response(error.details.description, {
      status: error.status,
    });
  }

  const token = authHeader.substring(7);

  if (!token) {
    const error = new BadRequestError("Bad Request", {
      title: "Invalid Header",
      description: "Empty Bearer token",
    });
    throw new Response(error.details.description, {
      status: error.status,
    });
  }

  try {
    const payload = (await verifyJwtToken(token)) as JWTPayload;

    if (!payload?.clientId || !payload?.apiKey) {
      throw new UnauthorizedError("Unauthorized", {
        title: "Unauthorized",
        description: "Invalid or missing client id or api key in JWT payload",
      });
    }

    const client = await prisma.client.findUnique({
      where: {
        client_id: payload.clientId,
        api_key: payload.apiKey,
        active: true,
        deleted_at: null,
      },
    });

    if (!client) {
      throw new InternalServerError("Internal Server Error", {
        title: "Error",
        description: "Client not found or inactive",
      });
    }

    return client;
  } catch (error) {
    let response: any;
    if (
      error instanceof BadRequestError ||
      error instanceof UnauthorizedError ||
      error instanceof InternalServerError
    ) {
      response = {
        status: error.status,
        message: error.details.description,
      };
    } else {
      if (error instanceof Error) {
        response = {
          status: 500,
          message: error.message,
        };
      }
    }

    Sentry.captureException(response.message);

    throw new Response(response.message, { status: response.status });
  }
};
