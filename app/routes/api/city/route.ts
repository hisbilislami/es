import { Prisma } from "@prisma/client";
import { data, LoaderFunctionArgs } from "@remix-run/node";
import * as Sentry from "@sentry/remix";

import { prisma } from "~/utils/db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const url = new URL(request.url);
    const provinceId = url.searchParams.get("f_province");
    const cityId = url.searchParams.get("f_city");
    const search = url.searchParams.get("search");
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "10", 10);
    const takeAll = limit === -1;
    const skip = (page - 1) * limit;

    const where: Prisma.CityWhereInput = {};
    where.active = true;
    where.deleted_at = null;
    if (provinceId && !isNaN(+provinceId)) {
      where.province_id = +provinceId;
    }

    if (cityId && !isNaN(+cityId)) {
      where.id = +cityId;
    }
    if (search) {
      where.name = {
        contains: search,
        mode: "insensitive",
      };
    }

    const cities = await prisma.city.findMany({
      include: {
        province: {
          include: {
            country: true,
          },
        },
      },
      where,
      ...(takeAll ? {} : { skip, take: limit }),
    });

    const totalCities = await prisma.city.count({ where });
    const totalPages = Math.ceil(totalCities / limit);
    return data({
      data: cities,
      pagination: {
        total: totalCities,
        page: takeAll ? 1 : page,
        limit: takeAll ? totalCities : limit,
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
