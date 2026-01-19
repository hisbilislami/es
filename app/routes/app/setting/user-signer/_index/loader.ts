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
    const filterParts = ["mprsn.deleted_at is null"];

    const queryParams: unknown[] = [];

    if (search) {
      filterParts.push(`(mprsn.name ILIKE $${queryParams.length + 1})`);
      queryParams.push(`%${search}%`);
      offset = 0;
    }

    const filter = filterParts.join(" AND ");

    const person = `
      SELECT 
        mprsn.id,
        mprsn.name,
        mprsn.type,
        mprsn.email,
        mprsn.medical_record_number,
        mprsn.active
      from
        esign.m_persons as mprsn
      WHERE ${filter}
      ORDER BY mprsn.id desc
      limit $${queryParams.length + 1}
      offset $${queryParams.length + 2}
    `;

    queryParams.push(size, offset);

    const queryResult = await prisma.$queryRawUnsafe<
      {
        id: number;
        name: string;
        type: string;
        email: string;
        medical_record_number: string;
        active: string;
      }[]
    >(person, ...queryParams);

    const serializedQueryResult = queryResult.map((person) => ({ ...person }));

    const queryTotal = `
      SELECT COUNT(*) as total FROM esign.m_persons mprsn WHERE ${filter}
    `;

    const totalCountResult = await prisma.$queryRawUnsafe<
      {
        total: number;
      }[]
    >(queryTotal, ...queryParams.slice(0, queryParams.length - 2));

    const totalCount = totalCountResult[0]?.total || 0;

    const session = await formSessionStorage.getSession(
      request.headers.get("Cookie"),
    );

    session.unset("user_signer_id");

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
    if (error instanceof Error) {
      Sentry.captureException(error);
    }

    Sentry.captureException(new Error("Unknown error occured"));
    throw new Response(JSON.stringify(request), {
      headers: await createDialogHeaders({
        type: "error",
        title: "Terjadi Kesahalan",
        description: "Silakan coba beberapa saat lagi.",
        confirmText: "Coba lagi",
      }),
    });
  }
};
