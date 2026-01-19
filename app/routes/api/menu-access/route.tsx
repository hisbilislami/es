import { data, LoaderFunctionArgs } from "@remix-run/node";
import * as Sentry from "@sentry/remix";

import { prisma } from "~/utils/db.server";
import { formSessionStorage } from "~/utils/session.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const url = new URL(request.url);
    const search = url.searchParams.get("q")?.trim();
    const menuIds = url.searchParams.get("menu_ids");
    // const page = parseInt(url.searchParams.get("page") || "1", 10);
    // const limit = parseInt(url.searchParams.get("limit") || "-1", 10);
    // const offset = (page - 1) * limit;

    const page = 1;
    const limit = 0;
    const offset = 0;

    const session = await formSessionStorage.getSession(
      request.headers.get("Cookie"),
    );

    const roleId = session.get("roles_form_id"); // If null, it's a new role

    const filters: string[] = ["mm.active = true"];
    const params: unknown[] = [];

    if (search) {
      filters.push(
        `(mm.title ILIKE $${params.length + 1} OR mm.code ILIKE $${params.length + 1})`,
      );
      params.push(`%${search}%`);
    }

    let menuIdArray: number[] = [];
    if (menuIds) {
      menuIdArray = menuIds.split(",").map(Number).filter(Boolean);
    }

    // Role-specific query (editing)
    if (roleId) {
      const filterSubs: string[] = ["rhs.active = true"];
      filterSubs.push(
        `(rhs.role_id = $${params.length + 1} or rhs.role_id is NULL)`,
      );
      params.push(Number(roleId));

      const filterSubStr = filterSubs.length
        ? `AND ${filterSubs.join(" AND ")}`
        : "";

      if (menuIdArray.length) {
        const placeholders = menuIdArray
          .map((_, i) => `$${params.length + i + 1}`)
          .join(", ");
        filters.push(
          `(mm.parent_id IN (${placeholders}) OR mm.id IN (${placeholders}))`,
        );
        params.push(...menuIdArray);
      }

      const filterStr = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

      const dataQuery = `
        SELECT
          mm.id AS menu_id,
          mm.title,
          mm.group,
          mm.group_position,
          mm.position,
          mm.parent_id,
          rhs.create,
          rhs.read,
          rhs.update,
          rhs.delete,
          COALESCE(
            -- Use parent's position if it's a child
            (SELECT position FROM esign.m_menus WHERE id = mm.parent_id),
            mm.position
          ) AS sort_parent_position
        FROM esign.m_menus mm
        LEFT JOIN esign.roles_has_menus rhs ON mm.id = rhs.menu_id ${filterSubStr}
        ${filterStr}
        ORDER BY
          sort_parent_position ASC,
          mm.parent_id NULLS FIRST,
          mm.group_position NULLS LAST,
          mm.position ASC;
        --LIMIT $${params.length + 1} OFFSET $${params.length + 2}
      `;

      const totalQuery = `
        SELECT COUNT(*) AS total
        FROM esign.roles_has_menus rhs
        LEFT JOIN esign.m_menus mm ON mm.id = rhs.menu_id
        ${filterStr}
      `;

      params.push(limit, offset);

      const [menus, total] = await Promise.all([
        prisma.$queryRawUnsafe(dataQuery, ...params),
        prisma.$queryRawUnsafe<{ total: number }[]>(
          totalQuery,
          ...params.slice(0, params.length - 2),
        ),
      ]);

      return data({
        data: menuIdArray.length > 0 ? menus : null,
        totalCount: menuIdArray.length > 0 ? Number(total[0]?.total) || 0 : 0,
        pageInfo: {
          hasNextPage: page * limit < (total[0]?.total || 0),
          hasPreviousPage: page > 1,
        },
      });
    }

    // New role: show all menus with default access
    const newFilters = [`mm.active = true`];

    if (search) {
      newFilters.push(`(mm.title ILIKE $1 OR mm.code ILIKE $1)`);
    }

    if (menuIdArray.length) {
      const baseIdx = search ? 1 : 0;
      const placeholders = menuIdArray
        .map((_, i) => `$${baseIdx + i + 1}`)
        .join(", ");
      newFilters.push(
        `(mm.parent_id IN (${placeholders}) OR mm.id IN (${placeholders}))`,
      );
    }

    const newFilterStr = newFilters.length
      ? `WHERE ${newFilters.join(" AND ")}`
      : "";

    const allMenusQuery = `
      SELECT
        mm.id AS menu_id,
        mm.title,
        mm.group,
        mm.group_position,
        mm.position,
        mm.parent_id,
        false AS create,
        false AS read,
        false AS update,
        false AS delete,
        COALESCE(
          -- Use parent's position if it's a child
          (SELECT position FROM esign.m_menus WHERE id = mm.parent_id),
          mm.position
        ) AS sort_parent_position
      FROM
        esign.m_menus mm
      ${newFilterStr}
      ORDER BY
        sort_parent_position ASC,
        mm.parent_id NULLS FIRST,
        mm.group_position NULLS LAST,
        mm.position ASC;
      --LIMIT $${(search ? 2 : 1) + menuIdArray.length} OFFSET $${(search ? 3 : 2) + menuIdArray.length}
    `;

    const allMenusTotalQuery = `
      SELECT COUNT(*) AS total
      FROM esign.m_menus mm
      ${newFilterStr}
    `;

    const newParams: unknown[] = [];
    if (search) newParams.push(`%${search}%`);
    newParams.push(...menuIdArray, limit, offset);

    const [allMenus, total] = await Promise.all([
      prisma.$queryRawUnsafe(allMenusQuery, ...newParams),
      prisma.$queryRawUnsafe<{ total: number }[]>(
        allMenusTotalQuery,
        ...newParams.slice(0, newParams.length - 2),
      ),
    ]);

    return data({
      data: allMenus,
      totalCount: Number(total[0]?.total) || 0,
      pageInfo: {
        hasNextPage: page * limit < (total[0]?.total || 0),
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      Sentry.captureException(error);
      return data({ data: [], message: error.message }, { status: 500 });
    }
    throw error;
  }
};
