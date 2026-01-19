import { env } from "../env.server";
import { createFetchApi, FetchApiOptions } from "../fetcher.server";
import redis from "../redis.server";
import { getUserSession, USER_CRED } from "../session.server";

import { BasePeruriApiResponse, PeruriGetTokenResponse } from "./types";

const { PERURI_SYSTEM_ID, PERURI_API_URL, PERURI_GATEWAY_API_KEY } = env();

const peruriBaseApiFetch = createFetchApi({
  baseUrl: PERURI_API_URL,
});

export type PeruriSession = {
  token: string;
  expiredDate: string;
};

export async function getPeruriToken(request: Request) {
  const session = await getUserSession(request);
  const userCred = session.get(USER_CRED);

  const peruriSession = await redis.get(
    `session:${userCred.username}--peruri-token`,
  );

  if (!peruriSession) {
    throw new Error("Unauthorized");
  }

  return JSON.parse(peruriSession) as PeruriSession;
}

async function setPeruriToken({
  payload,
  username,
}: {
  payload: PeruriSession;
  username: string;
}) {
  await redis.set(
    `session:${username}--peruri-token`,
    JSON.stringify(payload),
    "EX",
    60 * 60 * 24,
  );
}

export async function destroyPeruriToken(request: Request) {
  const session = await getUserSession(request);
  const userCred = session.get(USER_CRED);

  await redis.del(`session:${userCred.username}--peruri-token`);
}

export async function fetchPeruriToken(username: string) {
  try {
    const response = await peruriBaseApiFetch<PeruriGetTokenResponse>(
      "/jwtSandbox/1.0/getJsonWebToken/v1",
      {
        method: "POST",
        headers: {
          "x-Gateway-APIKey": PERURI_GATEWAY_API_KEY,
        },
        body: {
          param: {
            systemId: PERURI_SYSTEM_ID,
          },
        },
      },
    );

    if (response.resultDesc !== "Success") {
      throw new Error(`Gagal mendapatkan token baru: ${response.resultDesc}`);
    }

    const tokenData = response.data;
    if (!tokenData?.jwt) {
      throw new Error("Gagal mendapatkan token");
    }

    await setPeruriToken({
      payload: {
        token: tokenData.jwt,
        expiredDate: tokenData.expiredDate,
      },
      username,
    });

    return tokenData.jwt;
  } catch (error) {
    console.error("Error fetch token:", error);
    return null;
  }
}

export async function peruriApiFetch<T>(
  url: string,
  options: FetchApiOptions = {},
  request: Request,
): Promise<BasePeruriApiResponse<T>> {
  const token = await getPeruriToken(request);

  if (token.token) {
    options.headers = {
      ...options.headers,
      "x-Gateway-APIKey": PERURI_GATEWAY_API_KEY,
      Authorization: `Bearer ${token}`,
    };
  }

  try {
    const response = await peruriBaseApiFetch<BasePeruriApiResponse<T>>(
      url,
      options,
    );

    return response as BasePeruriApiResponse<T>;
  } catch (error) {
    if (error.status === 401 || error.message === "Unauthorized") {
      let username = "";
      if (request) {
        const session = await getUserSession(request);
        const userCred = session.get(USER_CRED);
        username = userCred.username;
      }

      const newToken = await fetchPeruriToken(username);

      if (newToken) {
        options.headers = {
          ...options.headers,
          "x-Gateway-APIKey": PERURI_GATEWAY_API_KEY,
          Authorization: `Bearer ${newToken}`,
        };

        return peruriBaseApiFetch<BasePeruriApiResponse<T>>(url, options);
      } else {
        throw new Error("Gagal refetch token, silakan login kembali.");
      }
    }

    console.error("Error call peruri api:", error);
    throw error; // Re-throw error agar bisa ditangani di loader atau action
  }
}
