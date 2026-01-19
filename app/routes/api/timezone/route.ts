import { Prisma } from "@prisma/client";
import { data, LoaderFunctionArgs } from "@remix-run/node";
import * as Sentry from "@sentry/remix";

import { prisma } from "~/utils/db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const url = new URL(request.url);
    const search = url.searchParams.get("search");
    const timezoneId = url.searchParams.get("f_timezone");
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "10", 10);
    const takeAll = limit === -1;
    const skip = (page - 1) * limit;

    const where: Prisma.TimezoneWhereInput = {};

    if (timezoneId && !isNaN(+timezoneId)) {
      where.id = +timezoneId;
    }

    where.deleted_at = null;
    where.active = true;

    if (search) {
      where.name = {
        contains: search,
        mode: "insensitive",
      };
    }

    const timezone = await prisma.timezone.findMany({
      where,
      ...(takeAll ? {} : { skip, take: limit }),
    });

    const totalTimezone = await prisma.timezone.count({ where });
    const totalPages = Math.ceil(totalTimezone / limit);

    return data({
      data: timezone,
      pagination: {
        total: totalTimezone,
        page: takeAll ? 1 : page,
        limit: takeAll ? totalTimezone : limit,
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
