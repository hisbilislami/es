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
    const offset = page * size;

    const search = searchParams.get("q");

    const filterParts = ["mal.deleted_at is null"];
    const queryParams: unknown[] = [];

    if (search) {
      filterParts.push(
        `(mal.action ILIKE $${queryParams.length + 1} OR mu.username ILIKE $${queryParams.length + 2} OR mal.ip_address ILIKE $${queryParams.length + 3} OR mal.tenant_id ILIKE $${queryParams.length + 4} OR mal.category ILIKE $${queryParams.length + 5})`,
      );
      queryParams.push(
        `%${search}%`,
        `%${search}%`,
        `%${search}%`,
        `%${search}%`,
        `%${search}%`,
      );
    }

    const filter = filterParts.join(" AND ");

    const query = `
      SELECT mal.*, TO_CHAR(mal.created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta', 'DD-MM-YYYY HH24:MI:SS') as created_at, mu.username as user FROM
        esign.m_activity_log mal
      LEFT JOIN esign.m_users AS mu
        ON mu.id = mal.user_id
      WHERE
        ${filter}
      ORDER BY mal.id DESC
      LIMIT $${queryParams.length + 1}
      OFFSET $${queryParams.length + 2};
    `;
    queryParams.push(size, offset);

    const queryResult = await prisma.$queryRawUnsafe<
      {
        id: number;
        user: string;
        tenant_id: string;
        action: string;
        category: string;
        ip_address: string;
        created_at: string;
      }[]
    >(query, ...queryParams);

    const serializedQueryResult = queryResult.map((documents) => ({
      ...documents,
    }));

    const queryTotal = `
      SELECT COUNT(*) as total
      FROM
        esign.m_activity_log mal
      LEFT JOIN esign.m_users AS mu
        ON mu.id = mal.user_id
      WHERE
        ${filter}
    `;

    const totalCountResult = await prisma.$queryRawUnsafe<{ total: number }[]>(
      queryTotal,
      ...queryParams.slice(0, queryParams.length - 2),
    );

    const totalCount = totalCountResult[0]?.total || 0;

    const session = await formSessionStorage.getSession(
      request.headers.get("Cookie"),
    );

    session.unset("LogActivityId");

    return new Response(
      JSON.stringify({
        result: {
          data: serializedQueryResult,
          totalCount: Number(totalCount),
          pageInfo: {
            hasNextPage: (page + 1) * size < totalCount,
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
    if (error instanceof Error) {
      Sentry.captureException(error);
    } else {
      Sentry.captureException(new Error("Unknown error occurred"));
    }

    throw new Response(JSON.stringify(request), {
      headers: await createDialogHeaders({
        type: "error",
        title: "Terjadi Kesalahan",
        description: "Silakan coba beberapa saat lagi",
        confirmText: "Coba lagi",
      }),
    });
  }
};
