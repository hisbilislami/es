import { LoaderFunctionArgs } from "@remix-run/node";
import * as Sentry from "@sentry/remix";

import { requireUserId } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { createDialogHeaders } from "~/utils/dialog.server";

export const loaderHandler = async (
  request: LoaderFunctionArgs["request"],
  id: number,
) => {
  try {
    await requireUserId(request);

    const companyId = id;

    const searchParams = new URL(request.url).searchParams;
    const size = Number(searchParams.get("size")) || 10;
    const page = Number(searchParams.get("page")) || 0;
    let offset = page * size;

    const search = searchParams.get("q");
    const filterParts = [
      "mcc.deleted_at is null",
      `mcc.company_id=${companyId}`,
    ];

    const queryParams: unknown[] = [];

    if (search) {
      filterParts.push(
        `(mct.name ILIKE $${queryParams.length + 1} or mcc.description ILIKE $${queryParams.length + 1})`,
      );
      queryParams.push(`%${search}%`);

      offset = 0;
    }

    const filter = filterParts.join(" AND ");

    const query = `SELECT 
                    mcc.id, 
                    mcc.company_id, 
                    mcc.contact_type_id as contact_type, 
                    mcc.description, 
                    mct.name as contact_type_name
                  from 
                    esign.m_company_contact mcc 
                  LEFT JOIN esign.m_contact_type mct on mct.id = mcc.contact_type_id
                  WHERE ${filter} 
                  ORDER BY mct.name ASC
                  LIMIT $${queryParams.length + 1} 
                  OFFSET $${queryParams.length + 2}`;

    queryParams.push(size, offset);

    const queryResult = await prisma.$queryRawUnsafe<
      {
        id: number;
        company_id: string;
        contact_type: string;
        description: string;
        contact_type_name: string;
      }[]
    >(query, ...queryParams);

    const serializedQueryResult = queryResult.map((city) => ({
      ...city,
    }));

    const queryTotal = `SELECT COUNT(*) as total FROM esign.m_cities as mci LEFT JOIN esign.m_provinces mp on mp.id = mci.province_id LEFT JOIN esign.m_country mc ON mc.id = mp.country_id LEFT JOIN esign.m_timezone mt on mt.id = mci.timezone_id WHERE ${filter}`;

    const totalCountResult = await prisma.$queryRawUnsafe<{ total: number }[]>(
      queryTotal,
      ...queryParams.slice(0, queryParams.length - 2),
    );

    const totalCount = totalCountResult[0]?.total || 0;

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
        },
      },
    );
  } catch (error) {
    if (error instanceof Error) {
      Sentry.captureException(error);
    }

    Sentry.captureException(new Error("Unknown error occured."));
    throw new Response(JSON.stringify(request), {
      headers: await createDialogHeaders({
        type: "error",
        title: "Terjadi kesalahan",
        description: "Silakan coba kembali beberapa saat lagi.",
        confirmText: "Coba lagi",
      }),
    });
  }
};
