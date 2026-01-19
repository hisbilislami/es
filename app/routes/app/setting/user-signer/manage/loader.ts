import { data, LoaderFunctionArgs } from "@remix-run/node";
import * as Sentry from "@sentry/remix";

import { requireUserId } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { createDialogHeaders } from "~/utils/dialog.server";
import { pathKeyToUrl } from "~/utils/file-uploads.server";
import { formSessionStorage } from "~/utils/session.server";

export const loaderHandler = async (request: LoaderFunctionArgs["request"]) => {
  try {
    await requireUserId(request);

    const session = await formSessionStorage.getSession(
      request.headers.get("Cookie"),
    );

    const id = session.get("user_signer_id");
    let userSigner = null;

    if (id) {
      userSigner = await prisma.person.findFirst({
        where: {
          id: Number(id),
        },
        include: {
          person_identity: {
            where: {
              active: true,
              deleted_at: null,
            },
            include: {
              identity: {
                select: {
                  name: true,
                  id: true,
                },
              },
              issuer_country: {
                select: {
                  name: true,
                  id: true,
                },
              },
              file_identity: {
                select: {
                  origin_name: true,
                  key: true,
                },
              },
            },
          },
          company_employee: {
            where: {
              active: true,
              deleted_at: null,
            },
            take: 1,
            include: {
              company: {
                select: {
                  name: true,
                  id: true,
                },
              },
              working_unit: {
                select: {
                  name: true,
                  id: true,
                },
              },
              job_position: {
                select: {
                  name: true,
                  id: true,
                },
              },
            },
          },
          subdistrict: {
            select: {
              name: true,
              postal_code: true,
              district: {
                select: {
                  name: true,
                  id: true,
                  city: {
                    select: {
                      name: true,
                      id: true,
                      province: {
                        select: {
                          name: true,
                          id: true,
                          country: {
                            select: { name: true, id: true },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });
    }

    if (userSigner) {
      const identitiesWithUrl = await Promise.all(
        userSigner.person_identity.map(async (pi) => {
          const file_identity = pi.file_identity
            ? {
                ...pi.file_identity,
                url: await pathKeyToUrl(pi.file_identity.key, 60 * 60),
              }
            : null;

          return {
            ...pi,
            file_identity,
          };
        }),
      );

      return data({
        data: {
          ...userSigner,
          person_identity: identitiesWithUrl,
        },
        status: "success",
      });
    }

    return data({
      data: null,
      status: "success",
    });
  } catch (error) {
    let errorMessage = "";

    if (error instanceof Error) {
      errorMessage = error.message;
      Sentry.captureException(error);
    }

    if (process.env.NODE_ENV === "development") {
      console.error(errorMessage);
    }

    Sentry.captureException(new Error("Unknown error occured."));
    throw new Response(JSON.stringify(request), {
      headers: await createDialogHeaders({
        type: "error",
        title: "Terjadi kesalahan",
        description: "Silakan coba kembali beberapa saat lagi",
        confirmText: "Coba lagi",
      }),
    });
  }
};
