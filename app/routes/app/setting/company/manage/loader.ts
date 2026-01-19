import { data, LoaderFunctionArgs } from "@remix-run/node";
import * as Sentry from "@sentry/remix";

import { requireUserId } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { createDialogHeaders } from "~/utils/dialog.server";
import { formSessionStorage } from "~/utils/session.server";

export const loaderHandler = async (request: LoaderFunctionArgs["request"]) => {
  try {
    await requireUserId(request);

    const session = await formSessionStorage.getSession(
      request.headers.get("Cookie"),
    );

    let id = session.get("company_id");

    if (!id) {
      id = null;
    }

    const emptyAddress = (type: "shipping" | "billing") => ({
      id: null,
      attention: "",
      address_type: type,
      address: "",
      country: "",
      province: "",
      city: "",
      district: "",
      subdistrict: "",
    });

    const company = await prisma.company.findFirst({
      include: {
        company_contact: {
          include: {
            contact_type: true,
          },
          orderBy: {
            id: "asc",
          },
        },
        company_address: {
          include: {
            subdistrict: {
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
            },
          },
        },
        company_contact_person: {
          include: {
            salutation: true,
          },
          orderBy: {
            id: "desc",
          },
        },
      },
      where: { id: Number(id) },
    });

    const shipping = company?.company_address.find(
      (a) => a.address_type === "shipping",
    );

    const billing = company?.company_address.find(
      (a) => a.address_type === "billing",
    );

    const normalized = company
      ? {
          ...company,
          contacts: company.company_contact.map((c) => ({
            id: String(c.id) ?? null,
            contact_type: String(c.contact_type_id) ?? "",
            contact_type_name: c.contact_type?.name ?? "",
            description: c.description ?? "",
            primary: c.primary ? (c.primary ? "1" : "0") : "0",
          })),
          contact_persons: company.company_contact_person.map((ccp) => ({
            id: String(ccp.id) ?? null,
            salutation: String(ccp.salutation_id) ?? "",
            salutation_name: ccp.salutation?.name ?? "",
            first_name: ccp.first_name ?? "",
            last_name: ccp.last_name ?? "",
            phone_number: ccp.phone_number ?? "",
            email: ccp.email ?? "",
          })),
          shipping_address: shipping
            ? {
                id: shipping.id,
                attention: shipping.attention,
                address_type: shipping.address_type,
                address: shipping.address,
                subdistrict: shipping.subdistrict_id?.toString() ?? "",
                district: shipping.subdistrict?.district_id?.toString() ?? "",
                city: shipping.subdistrict?.district?.city_id?.toString() ?? "",
                province:
                  shipping.subdistrict?.district?.city?.province_id?.toString() ??
                  "",
                country:
                  shipping.subdistrict?.district?.city?.province?.country_id?.toString() ??
                  "",
              }
            : emptyAddress("shipping"),
          billing_address: billing
            ? {
                id: billing.id,
                attention: billing.attention,
                address_type: billing.address_type,
                address: billing.address,
                subdistrict: billing.subdistrict_id?.toString() ?? "",
                district: billing.subdistrict?.district_id?.toString() ?? "",
                city: billing.subdistrict?.district?.city_id?.toString() ?? "",
                province:
                  billing.subdistrict?.district?.city?.province_id?.toString() ??
                  "",
                country:
                  billing.subdistrict?.district?.city?.province?.country_id?.toString() ??
                  "",
              }
            : emptyAddress("billing"),
        }
      : null;

    return data({
      data: normalized,
      status: "success",
    });
  } catch (error) {
    if (error instanceof Error) {
      Sentry.captureException(error);
    }

    Sentry.captureException(new Error("Unknown error occured."));
    throw new Response(JSON.stringify(request), {
      headers: await createDialogHeaders({
        type: "error",
        title: "Terjadi kesalahan",
        description: "Silakan coba kembali beberapa saat lagi.",
        confirmText: "Coba lagi",
      }),
    });
  }
};
