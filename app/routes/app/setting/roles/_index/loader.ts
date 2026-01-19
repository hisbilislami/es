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
    const filterParts = ["mr.active = true"];
    const queryParams: unknown[] = [];

    if (search) {
      filterParts.push(`mr.name ILIKE $${queryParams.length + 1}`);
      queryParams.push(`%${search}`);
    }

    const filter = filterParts.join(" AND ");

    const query = `
      SELECT * from esign.m_roles mr 
      WHERE ${filter} 
      ORDER BY id ASC 
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
    `;

    queryParams.push(size, offset);

    const roles = await prisma.$queryRawUnsafe(query, ...queryParams);

    const rolesTotal = `SELECT COUNT(*) AS total FROM esign.m_roles mr WHERE ${filter}`;
    const rolesTotalResult = await prisma.$queryRawUnsafe<{ total: number }[]>(
      rolesTotal,
      ...queryParams.slice(0, queryParams.length - 2),
    );

    const totalRow = rolesTotalResult[0]?.total || 0;

    const session = await formSessionStorage.getSession(
      request.headers.get("Cookie"),
    );
    session.unset("roles_form_id");

    return new Response(
      JSON.stringify({
        result: {
          data: roles,
          totalCount: Number(totalRow),
          pageInfo: {
            hasNextPage: (page + 1) * size < totalRow,
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
    }

    Sentry.captureException(new Error("Unknown error occurred"));
    throw new Response(JSON.stringify(request), {
      headers: await createDialogHeaders({
        type: "error",
        title: "Terjadi Kesalahan",
        description: "Silah coba beberapa saat lagi",
        confirmText: "Coba Lagi",
      }),
    });
  }
};
