import { Prisma } from "@prisma/client";
import { data, LoaderFunctionArgs } from "@remix-run/node";
import * as Sentry from "@sentry/remix";

import { prisma } from "~/utils/db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const url = new URL(request.url);
    const cityId = url.searchParams.get("f_city");
    const districtId = url.searchParams.get("f_district");
    const search = url.searchParams.get("search");
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "10", 10);
    const takeAll = limit === -1;
    const skip = (page - 1) * limit;

    const where: Prisma.DistrictWhereInput = {};
    where.active = true;
    where.deleted_at = null;
    if (districtId && !isNaN(+districtId)) {
      where.id = +districtId;
    }

    if (cityId && !isNaN(+cityId)) {
      where.city_id = +cityId;
    }

    if (search) {
      where.name = {
        contains: search,
        mode: "insensitive",
      };
    }

    const districts = await prisma.district.findMany({
      include: {
        city: {
          include: {
            province: {
              include: {
                country: true,
              },
            },
          },
        },
      },
      where,
      ...(takeAll ? {} : { skip, take: limit }),
    });

    const totalDistrict = await prisma.district.count({ where });
    const totalPages = Math.ceil(totalDistrict / limit);
    return data({
      data: districts,
      pagination: {
        total: totalDistrict,
        page: takeAll ? 1 : page,
        limit: takeAll ? totalDistrict : limit,
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
