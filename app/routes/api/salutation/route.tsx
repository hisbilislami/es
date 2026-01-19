import { Prisma } from "@prisma/client";
import { data, LoaderFunctionArgs } from "@remix-run/node";
import * as Sentry from "@sentry/remix";

import { requireUserId } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    await requireUserId(request);
    const url = new URL(request.url);
    const search = url.searchParams.get("search");
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "10", 10);
    const takeAll = limit === -1;
    const skip = (page - 1) * limit;

    const where: Prisma.SalutationWhereInput = {};

    if (search) {
      where.name = {
        contains: search,
        mode: "insensitive",
      };
    }

    where.deleted_at = null;
    where.active = true;

    const result = await prisma.salutation.findMany({
      where,
      ...(takeAll ? {} : { skip, take: limit }),
    });

    const totalSalutation = await prisma.salutation.count({ where });
    const totalPages = Math.ceil(totalSalutation / limit);

    return data({
      data: result,
      pagination: {
        total: totalSalutation,
        page: takeAll ? 1 : page,
        limit: takeAll ? totalSalutation : limit,
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
