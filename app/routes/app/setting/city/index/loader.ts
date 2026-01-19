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

    const country = searchParams.get("country");
    const province = searchParams.get("province");
    const search = searchParams.get("q");
    const filterParts = ["mci.deleted_at is null"];

    const queryParams: unknown[] = [];

    if (search) {
      filterParts.push(
        `(mci.name ILIKE $${queryParams.length + 1} or mci.code ILIKE $${queryParams.length + 1} or mt.name ILIKE $${queryParams.length + 1} or mci.sni_name ILIKE $${queryParams.length + 1} or mp.name ILIKE $${queryParams.length + 1} or mc.name ILIKE $${queryParams.length + 1})`,
      );
      queryParams.push(`%${search}%`);

      offset = 0;
    }

    if (country) {
      filterParts.push(`mp.country_id = $${queryParams.length + 1}`);
      queryParams.push(`${country}`);
      offset = 0;
    }

    if (province) {
      filterParts.push(`mci.province_id = $${queryParams.length + 1}`);
      queryParams.push(`${province}`);
      offset = 0;
    }

    const filter = filterParts.join(" AND ");

    const query = `SELECT 
                    mci.id, 
                    mci.code, 
                    mci.name, 
                    mci.sni_name, 
                    mp.name as province_name,
                    mci.province_id,
                    mc.name as country_name, 
                    mp.country_id, 
                    mci.active,
                    mt.name as timezone_name,
                    mci.timezone_id
                  from 
                    esign.m_cities mci 
                  LEFT JOIN esign.m_provinces mp on mp.id = mci.province_id 
                  LEFT JOIN esign.m_country mc on mc.id = mp.country_id 
                  LEFT JOIN esign.m_timezone mt on mt.id = mci.timezone_id
                  WHERE ${filter} 
                  ORDER BY mp.name ASC
                  LIMIT $${queryParams.length + 1} 
                  OFFSET $${queryParams.length + 2}`;

    queryParams.push(size, offset);

    const queryResult = await prisma.$queryRawUnsafe<
      {
        id: number;
        code: string;
        name: string;
        sni_name: string;
        province_name: string;
        province_id: number;
        country_name: string;
        country_id: number;
        timezone: string;
        active: boolean;
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

    const session = await formSessionStorage.getSession(
      request.headers.get("Cookie"),
    );

    session.unset("city_id");

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
