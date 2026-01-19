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
    const filterParts = ["md.deleted_at is null"];

    const queryParams: unknown[] = [];

    if (search) {
      filterParts.push(
        `(md.name ILIKE $${queryParams.length + 1} or md.code ILIKE $${queryParams.length + 1} or mci.name ILIKE $${queryParams.length + 1} or mp.name ILIKE $${queryParams.length + 1} or mc.name ILIKE $${queryParams.length + 1})`,
      );
      queryParams.push(`%${search}%`);
      offset = 0;
    }

    const filter = filterParts.join(" AND ");

    const query = `
            SELECT 
            md.id,
            md.code,
            md.name,
            md.active,
            md.city_id,
            mci.name as city,
            mci.province_id,
            mp.name as province,
            mp.country_id,
            mc.name as country
            FROM 
            esign.m_district md 
            LEFT JOIN esign.m_cities mci on mci.id = md.city_id
            LEFT JOIN esign.m_provinces mp on mp.id = mci.province_id
            LEFT JOIN esign.m_country mc on mc.id = mp.country_id
            WHERE ${filter} 
            LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;

    queryParams.push(size, offset);

    const queryResult = await prisma.$queryRawUnsafe<
      {
        id: number;
        code: string;
        name: string;
        iso_code: string;
        iso_name: string;
        phone_code: string;
      }[]
    >(query, ...queryParams);

    const serializedQueryResult = queryResult.map((district) => ({
      ...district,
    }));

    const queryTotal = `SELECT 
            COUNT(*) as total 
            FROM esign.m_district md
            LEFT JOIN esign.m_cities mci on mci.id = md.city_id
            LEFT JOIN esign.m_provinces mp on mp.id = mci.province_id
            LEFT JOIN esign.m_country mc on mc.id = mp.country_id
            WHERE ${filter}`;

    const totalCountResult = await prisma.$queryRawUnsafe<{ total: number }[]>(
      queryTotal,
      ...queryParams.slice(0, queryParams.length - 2),
    );

    const totalCount = totalCountResult[0]?.total || 0;

    const session = await formSessionStorage.getSession(
      request.headers.get("Cookie"),
    );

    session.unset("district_id");

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
