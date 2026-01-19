import { LoaderFunctionArgs } from "@remix-run/node";
import * as Sentry from "@sentry/remix";

import { requireUserId } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { createDialogHeaders } from "~/utils/dialog.server";
import { BadRequestError } from "~/utils/error.server";
import { formSessionStorage } from "~/utils/session.server";

export const loaderHandler = async (request: LoaderFunctionArgs["request"]) => {
  try {
    await requireUserId(request);

    const session = await formSessionStorage.getSession(
      request.headers.get("Cookie"),
    );

    let id = session.get("roles_form_id");

    if (!id) {
      id = null;
    }

    // const url = new URL(request.url);
    // const page = parseInt(url.searchParams.get("page") || "1", 10);
    // const limit = parseInt(url.searchParams.get("limit") || "-1", 10);
    // const offset = (page - 1) * (limit);

    if (id) {
      const roles = await prisma.roles.findFirst({
        where: { id: Number(id) },
        select: {
          id: true,
          code: true,
          name: true,
          description: true,
          active: true,
        },
      });

      const total = await prisma.rolesHasMenus.count({
        where: {
          role_id: roles?.id,
        },
      });

      const result = await prisma.rolesHasMenus.findMany({
        where: {
          role_id: roles?.id,
        },
        select: {
          role_id: true,
          rel_rhm_roles: {
            select: { name: true, code: true, description: true, active: true },
          },
          menu_id: true,
          read: true,
          create: true,
          update: true,
          delete: true,
          rel_rhm_menus: {
            select: {
              parent_id: true,
              title: true,
              group: true,
            },
          },
        },
      });

      type FormattedResultType = {
        role_id: number;
        role_code: string;
        role_name: string;
        role_description: string | null;
        role_active: boolean;
        modules: number[];
        permissions: {
          menu_id: string;
          parent_id: string | null;
          group: string | null;
          title: string;
          create: boolean;
          read: boolean;
          update: boolean;
          delete: boolean;
        }[];
      };

      let formattedResult: FormattedResultType | null = null;

      if (result.length > 0) {
        // Create the initial value from the first item (safe because length > 0)
        const first = result[0];

        formattedResult = {
          role_id: first.role_id,
          role_code: first.rel_rhm_roles.code,
          role_name: first.rel_rhm_roles.name,
          role_description: first.rel_rhm_roles.description,
          role_active: first.rel_rhm_roles.active,
          modules: [],
          permissions: [],
        };

        for (const item of result) {
          const parentId = item.rel_rhm_menus?.parent_id;
          const permission = {
            menu_id: String(item.menu_id),
            parent_id: parentId ? String(parentId) : null,
            group: item.rel_rhm_menus?.group ?? null,
            title: item.rel_rhm_menus?.title ?? "-",
            create: item.create,
            read: item.read,
            update: item.update,
            delete: item.delete,
          };

          formattedResult.permissions.push(permission);

          if (!parentId) {
            formattedResult.modules.push(item.menu_id);
          }
        }
      } else if (roles) {
        formattedResult = {
          role_id: roles.id,
          role_code: roles.code,
          role_name: roles.name,
          role_description: roles.description,
          role_active: roles.active,
          modules: [],
          permissions: [],
        };
      }

      return {
        data: formattedResult,
        pagination: {
          total,
          page: 1,
          limit: 0,
          totalPages: 0,
        },
      };
    }

    return {
      data: null,
      pagination: {
        total: 0,
        page: 1,
        limit: 0,
        totalPages: 0,
      },
    };
  } catch (error) {
    let response: Response;
    if (error instanceof BadRequestError) {
      Sentry.captureException(error);
      response = new Response(JSON.stringify(request), {
        headers: await createDialogHeaders({
          ...error.details,
          type: "error",
          confirmText: "Oke",
        }),
      });

      return response;
    }

    Sentry.captureException(new Error("Unknown error occurred"));
    response = new Response(JSON.stringify(request), {
      headers: await createDialogHeaders({
        type: "error",
        title: "Terjadi Kesalahan",
        description: "Silah coba beberapa saat lagi",
        confirmText: "Coba Lagi",
      }),
    });

    return response;
  }
};
