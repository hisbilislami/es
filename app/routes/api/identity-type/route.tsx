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

    const where: Prisma.IdentityWhereInput = {};

    if (search) {
      where.name = {
        contains: search,
        mode: "insensitive",
      };
    }

    where.deleted_at = null;
    where.active = true;

    const result = await prisma.identity.findMany({
      where,
      ...(takeAll ? {} : { skip, take: limit }),
    });

    const totalIdentity = await prisma.identity.count({ where });
    const totalPages = Math.ceil(totalIdentity / limit);

    return data({
      data: result,
      pagination: {
        total: totalIdentity,
        page: takeAll ? 1 : page,
        limit: takeAll ? totalIdentity : limit,
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
