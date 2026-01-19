import { data, LoaderFunctionArgs } from "@remix-run/node";
import * as Sentry from "@sentry/remix";
import { prisma } from "~/utils/db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const url = new URL(request.url);
    const search = url.searchParams.get("search");
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "10", 10);
    const offset = (page - 1) * limit;

    let filter = " parent_id is null AND active = true";

    if (search) {
      filter += ` AND title ILIKE '%${search}'`;
    }

    const query = `
      SELECT * from esign.m_menus
      WHERE ${filter}
      ORDER BY id DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const moduleResult = await prisma.$queryRawUnsafe(query);

    const queryTotal = `
      SELECT COUNT(*) as total FROM esign.m_menus
      WHERE ${filter}
    `;
    const totalCountResult =
      await prisma.$queryRawUnsafe<{ total: number }[]>(queryTotal);
    const totalModules = Number(totalCountResult[0].total);
    const totalPages = Math.ceil(totalModules / limit);

    return data({
      data: moduleResult,
      pagination: {
        total: totalModules,
        page,
        limit,
        totalPages,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      Sentry.captureException(error);
      return data(
        {
          data: [],
          message: error.message,
        },
        { status: 500 },
      );
    }
  }
};
