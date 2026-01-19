import { Prisma, Menus } from "@prisma/client";
import { data, LoaderFunctionArgs } from "@remix-run/node";
import * as Sentry from "@sentry/remix";

import { AppModuleMenu } from "~/components/layout/types";
import { requireUserId } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const userId = await requireUserId(request);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.role_id) {
      return data([]);
    }

    const userMenus = await prisma.rolesHasMenus.findMany({
      where: { role_id: user.role_id, active: true },
      select: { menu_id: true },
    });

    const menuIds = userMenus.map((um) => um.menu_id);

    if (menuIds.length === 0) {
      return data([]);
    }

    const query = Prisma.sql`
      WITH RECURSIVE menu_tree AS (
        SELECT * FROM esign.m_menus WHERE id IN (${Prisma.join(menuIds)})
        UNION
        SELECT m.* FROM esign.m_menus m JOIN menu_tree mt ON m.id = mt.parent_id
      )
      SELECT * FROM menu_tree
      WHERE deleted_at IS NULL AND active = TRUE
    `;

    const allMenus = await prisma.$queryRaw<Menus[]>(query);

    // Sort logic applied
    allMenus.sort((a, b) => {
      // Parent first (null parent_id = top-level)
      const aIsParent = a.parent_id === null ? 0 : 1;
      const bIsParent = b.parent_id === null ? 0 : 1;

      if (aIsParent !== bIsParent) return aIsParent - bIsParent;

      // Same level: sort by group_position (if grouped), then by position
      const aGroup = Number(a.group_position ?? 0);
      const bGroup = Number(b.group_position ?? 0);
      const aPos = Number(a.position ?? 0);
      const bPos = Number(b.position ?? 0);

      return aGroup - bGroup || aPos - bPos;
    });

    const parentGrouped = new Map<string, AppModuleMenu>();

    for (const menu of allMenus) {
      if (menu.parent_id === null) {
        parentGrouped.set(menu.id.toString(), {
          icon: menu.icon ?? "layout-grid",
          label: menu.title,
          submodules: [],
        });
      }
    }

    for (const menu of allMenus) {
      if (menu.parent_id !== null) {
        const parent = parentGrouped.get(menu.parent_id.toString());
        if (!parent) continue;

        if (menu.group) {
          let group = parent.submodules.find((s) => s.label === menu.group);
          if (!group) {
            group = {
              label: menu.group,
              path: "",
              icon: "tabler:folder",
              pages: [],
            };
            parent.submodules.push(group);
          }
          group.pages.push({
            label: menu.title,
            path: menu.link ?? "#",
            icon: menu.icon ?? "tabler:help-square-rounded",
          });
        } else {
          parent.submodules.push({
            label: menu.title,
            path: menu.link ?? "#",
            icon: menu.icon ?? "tabler:help-square-rounded",
            pages: [],
          });
        }
      }
    }

    return data(Array.from(parentGrouped.values()));
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
