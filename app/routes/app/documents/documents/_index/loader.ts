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
    const status = searchParams.get("status");
    const date = searchParams.get("date");
    const filterParts = ["td.deleted_at is null"];
    const queryParams: any[] = [];

    if (search) {
      filterParts.push(
        `(td.name ILIKE $${queryParams.length + 1} OR latest_status.name ILIKE $${queryParams.length + 2})`,
      );
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    if (status) {
      filterParts.push(`latest_status.name = $${queryParams.length + 1}`);
      queryParams.push(`${status}`);
    }

    if (date) {
      filterParts.push(`td.date::date = $${queryParams.length + 1}::date`);
      queryParams.push(`${date}`);
    }

    const filter = filterParts.join(" AND ");

    const query = `
      SELECT
        td.id,
        td.name,
        TO_CHAR(td.updated_at, 'DD-MM-YYYY') as updated_at,
        TO_CHAR(td.date, 'DD-MM-YYYY') as date,
        latest_status.name AS status,
        td.file_url
      FROM
        esign.t_documents td
      LEFT JOIN (
          SELECT DISTINCT ON (document_id) 
            document_id, status_id, st.name
          FROM
            esign.rel_document_status rds
          LEFT JOIN esign.m_status st
            ON rds.status_id = st.id
          WHERE
            rds.deleted_at IS NULL
          ORDER BY
            rds.document_id, rds.created_at DESC
        ) AS latest_status
        ON td.id = latest_status.document_id
      WHERE
        ${filter}
      LIMIT $${queryParams.length + 1}
      OFFSET $${queryParams.length + 2};
    `;
    queryParams.push(size, offset);

    const queryResult = await prisma.$queryRawUnsafe<
      {
        id: number;
        name: string;
        updated_at: string;
        date: string;
        status: string;
        file_url: string;
      }[]
    >(query, ...queryParams);

    const serializedQueryResult = queryResult.map((documents) => ({
      ...documents,
    }));

    const queryTotal = `
      SELECT COUNT(*) as total
      FROM esign.t_documents td
      LEFT JOIN (
        SELECT DISTINCT ON (document_id) 
          document_id, status_id, st.name
        FROM esign.rel_document_status rds
        LEFT JOIN esign.m_status st ON rds.status_id = st.id
        WHERE rds.deleted_at IS NULL
        ORDER BY rds.document_id, rds.created_at DESC
      ) AS latest_status ON td.id = latest_status.document_id
      WHERE ${filter}
    `;

    const totalCountResult = await prisma.$queryRawUnsafe<{ total: number }[]>(
      queryTotal,
      ...queryParams.slice(0, queryParams.length - 2),
    );

    const totalCount = totalCountResult[0]?.total || 0;

    const session = await formSessionStorage.getSession(
      request.headers.get("Cookie"),
    );

    session.unset("id");

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
    }

    Sentry.captureException(new Error("Unknown error occurred"));
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
