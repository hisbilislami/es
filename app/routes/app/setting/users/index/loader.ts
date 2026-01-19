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
    const role = searchParams.get("role");
    const filterParts = ["mu.deleted_at is null"];

    const queryParams: unknown[] = [];

    if (search) {
      filterParts.push(
        `(mu.username ILIKE $${queryParams.length + 1} or mu.email ILIKE $${queryParams.length + 1} or mp.name ILIKE $${queryParams.length + 1} or mp.phone_number ILIKE $${queryParams.length + 1})`,
      );
      queryParams.push(`%${search}%`);
      offset = 0;
    }

    if (role) {
      filterParts.push(`mu.role_id = $${queryParams.length + 1}::int`);
      queryParams.push(`${role}`);
    }

    const filter = filterParts.join(" AND ");

    const personIdentity = `
            SELECT 
              jmpi.person_id,
              jmpi.number as identity_number,
              mi.name as identity_type
            from 
            esign.m_person_identity jmpi 
            LEFT JOIN esign.m_identity mi on mi.id = jmpi.identity_id
            where jmpi.active = true 
            and jmpi.deleted_at is null 
            and jmpi.primary = true
          `;

    const query = `
          SELECT 
            mu.id,
            mu.person_id,
            mpi.identity_number as nik,
            mu.role_id,
            mu.username,
            mp.name,
            mp.email,
            mp.phone_number,
            mr.name as role_name,
            mu.status
          FROM 
            esign.m_users mu 
          INNER JOIN esign.m_persons mp on mp.id = mu.person_id
          LEFT JOIN (${personIdentity}) as mpi on mpi.person_id = mp.id
          LEFT JOIN esign.m_roles mr on mr.id = mu.role_id
          WHERE ${filter} 
          LIMIT $${queryParams.length + 1} 
          OFFSET $${queryParams.length + 2}`;

    queryParams.push(size, offset);

    const queryResult = await prisma.$queryRawUnsafe<
      {
        id: number;
        person_id: number;
        role_id: number;
        nik: string;
        username: string;
        name: string;
        email: string;
        phone_number: string;
        role_name: string;
        status: string;
      }[]
    >(query, ...queryParams);

    const serializedQueryResult = queryResult.map((users) => ({
      ...users,
    }));

    const queryTotal = `
          SELECT 
            COUNT(*) as total 
          FROM 
            esign.m_users mu 
          INNER JOIN esign.m_persons mp on mp.id = mu.person_id
          LEFT JOIN (${personIdentity}) as mpi on mpi.person_id = mp.id
          LEFT JOIN esign.m_roles mr on mr.id = mu.role_id
          WHERE ${filter}`;

    const totalCountResult = await prisma.$queryRawUnsafe<{ total: number }[]>(
      queryTotal,
      ...queryParams.slice(0, queryParams.length - 2),
    );

    const totalCount = totalCountResult[0]?.total || 0;

    const session = await formSessionStorage.getSession(
      request.headers.get("Cookie"),
    );

    session.unset("user_id");

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
