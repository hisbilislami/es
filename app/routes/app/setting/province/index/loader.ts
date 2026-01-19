import { LoaderFunctionArgs } from "@remix-run/node";
import * as Sentry from "@sentry/remix";

import { requireUserId } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { createDialogHeaders } from "~/utils/dialog.server";
import { formSessionStorage } from "~/utils/session.server";

export const loaderHandler = async (request: LoaderFunctionArgs["request"]) => {
  try {
    await requireUserId(request);

    const searchParams = new URL(request.url).searchParams;
    const size = Number(searchParams.get("size")) || 10;
    const page = Number(searchParams.get("page")) || 0;
    let offset = page * size;

    const search = searchParams.get("q");
    const filterParts = ["mp.deleted_at is null"];

    const queryParams: unknown[] = [];

    if (search) {
      filterParts.push(
        `(mp.name ILIKE $${queryParams.length + 1} or mp.code ILIKE $${queryParams.length + 1} or mp.sni_name ILIKE $${queryParams.length + 1} or mc.name ILIKE $${queryParams.length + 1})`,
      );
      queryParams.push(`%${search}%`);
      offset = 0;
    }

    const filter = filterParts.join(" AND ");

    const query = `SELECT mp.id, mp.code, mp.name, mp.sni_name, mc.name as country_name, mp.country_id, mp.active from esign.m_provinces mp LEFT JOIN esign.m_country mc on mc.id = mp.country_id WHERE ${filter} ORDER BY mp.name ASC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2} `;

    queryParams.push(size, offset);

    const queryResult = await prisma.$queryRawUnsafe<
      {
        id: number;
        code: string;
        name: string;
        sni_name: string;
        country_name: string;
        country_id: number;
        active: boolean;
      }[]
    >(query, ...queryParams);

    const serializedQueryResult = queryResult.map((province) => ({
      ...province,
    }));

    const queryTotal = `SELECT COUNT(*) as total FROM esign.m_provinces as mp LEFT JOIN esign.m_country mc ON mc.id = mp.country_id WHERE ${filter}`;

    const totalCountResult = await prisma.$queryRawUnsafe<{ total: number }[]>(
      queryTotal,
      ...queryParams.slice(0, queryParams.length - 2),
    );

    const totalCount = totalCountResult[0]?.total || 0;

    const session = await formSessionStorage.getSession(
      request.headers.get("Cookie"),
    );

    session.unset("province_id");

    return new Response(
      JSON.stringify({
        result: {
          data: serializedQueryResult,
          totalCount: Number(totalCount),
          pageInfo: {
            hasNextPage: page * 1 * size < totalCount,
            hasPreviousPage: page > 0,
          },
        },
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Set-Cookie": await formSessionStorage.commitSession(session),
        },
      },
    );
  } catch (error) {
    let message = null;
    if (error instanceof Error) {
      Sentry.captureException(error);
      message = error.message;
    }

    Sentry.captureException(new Error("Unknown error occurred"));
    throw new Response(JSON.stringify(request), {
      headers: await createDialogHeaders({
        type: "error",
        title: "Terjadi Kesalahan",
        description: "Silakan coba beberapa saat lagi " + message,
        confirmText: "Coba lagi",
      }),
    });
  }
};
