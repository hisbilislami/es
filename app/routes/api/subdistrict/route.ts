import { Prisma } from "@prisma/client";
import { data, LoaderFunctionArgs } from "@remix-run/node";
import * as Sentry from "@sentry/remix";

import { prisma } from "~/utils/db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const url = new URL(request.url);
    const districtId = url.searchParams.get("f_district");
    const subdistrictId = url.searchParams.get("f_subdistrict");
    const search = url.searchParams.get("search");
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "10", 10);
    const takeAll = limit === -1;
    const skip = (page - 1) * limit;

    const where: Prisma.SubdistrictWhereInput = {};
    where.active = true;
    where.deleted_at = null;
    if (subdistrictId && !isNaN(+subdistrictId)) {
      where.id = +subdistrictId;
    }

    if (districtId && !isNaN(+districtId)) {
      where.district_id = +districtId;
    }

    if (search) {
      where.name = {
        contains: search,
        mode: "insensitive",
      };
    }

    const subdistricts = await prisma.subdistrict.findMany({
      include: {
        district: {
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
        },
      },
      where,
      ...(takeAll ? {} : { skip, take: limit }),
    });

    const totalSubdistrict = await prisma.subdistrict.count({ where });
    const totalPages = Math.ceil(totalSubdistrict / limit);

    console.log(subdistricts);

    return data({
      data: subdistricts,
      pagination: {
        total: totalSubdistrict,
        page: takeAll ? 1 : page,
        limit: takeAll ? totalSubdistrict : limit,
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
