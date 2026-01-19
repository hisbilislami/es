import { parseWithZod } from "@conform-to/zod";
import { Prisma } from "@prisma/client";
import { ActionFunctionArgs } from "@remix-run/node";
import * as Sentry from "@sentry/remix";

import { requireUserId } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { createDialogHeaders, redirectWithDialog } from "~/utils/dialog.server";
import { BadRequestError } from "~/utils/error.server";
import { logActivity } from "~/utils/log-activity.server";

import { CompanySchema } from "./schema/company.schema";
import { ContactPerson } from "./schema/contact-person.schema";
import { Contact } from "./schema/contact.schema";

export const actionHandler = async (request: ActionFunctionArgs["request"]) => {
  try {
    await requireUserId(request);

    const formData = await request.formData();

    const checkUnique = <T extends "code" | "phone_number" | "email">(
      field: T,
    ) => {
      return async (value: string) => {
        if (!value?.trim()) return true;

        const where = { [field]: value } as Record<T, string>;

        const exists = await prisma.company.findUnique({
          where: where as Prisma.CompanyWhereUniqueInput,
        });

        if (exists && !formData.get("id")) {
          return true;
        }
        return false;
      };
    };

    const submission = await parseWithZod(formData, {
      schema: (intent) =>
        CompanySchema(intent, {
          isCodeUnique: checkUnique("code"),
          isPhoneNumberUnique: checkUnique("phone_number"),
          isEmailUnique: checkUnique("email"),
        }),
      async: true,
    });

    if (submission.status !== "success") {
      return submission.reply();
    }

    const opt = submission.value?.id ? "update" : "new";

    const data: Record<string, unknown> = {
      id: submission.value.id,
      code: submission.value.code,
      name: submission.value.name,
      display_name: submission.value.display_name,
      phone_number: submission.value.phone_number,
      email: submission.value.email,
      registered_number: submission.value.registered_number,
      registered_date: submission.value.registered_date,
      active: submission.value.active === "y" ? true : false,
    };

    if (opt === "new") {
      delete data.id;

      data.company_address = {
        create: [
          {
            address_type: submission.value.billing_address.address_type,
            attention: submission.value.billing_address.attention,
            address: submission.value.billing_address.address,
            subdistrict: {
              connect: {
                id: Number(submission.value.billing_address.subdistrict),
              },
            },
          },
          {
            address_type: submission.value.shipping_address.address_type,
            attention: submission.value.shipping_address.attention,
            address: submission.value.shipping_address.address,
            subdistrict: {
              connect: {
                id: Number(submission.value.shipping_address.subdistrict),
              },
            },
          },
        ],
      };

      // query insert company contact should be here
      if (submission.value.contacts) {
        const companyContacts = submission.value.contacts.map((p) => {
          return {
            contact_type: { connect: { id: Number(p.contact_type) } },
            primary: p.primary === "1",
            description: p.description,
          };
        });

        data.company_contact = {
          create: companyContacts,
        };
      }

      if (submission.value.contact_persons) {
        const companyContactPersons = submission.value.contact_persons.map(
          (p) => {
            return {
              salutation: { connect: { id: Number(p.salutation) } },
              first_name: p.first_name,
              last_name: p.last_name,
              phone_number: p.phone_number,
              email: p.email,
            };
          },
        );

        data.company_contact_person = {
          create: companyContactPersons,
        };
      }

      const prismaData: Prisma.CompanyCreateInput =
        data as Prisma.CompanyCreateInput;

      await prisma.$transaction(async (tx) => {
        await tx.company.create({
          data: prismaData,
        });

        await logActivity({
          request,
          action: "Membuat master company profile",
          category: "Data Master",
        });
      });
    } else {
      const getCompanyById = await prisma.company.findFirst({
        where: { id: data.id as number },
      });

      if (!getCompanyById) {
        throw new BadRequestError("Bad Request", {
          title: "Gagal",
          description: "Data company profile tidak ditemukan.",
        });
      }

      const prismaData: Prisma.CompanyCreateInput =
        data as Prisma.CompanyCreateInput;
      await prisma.$transaction(async (tx) => {
        // --- 1. HANDLE CONTACTS ---
        if (submission.value.contacts) {
          const idsToDeleteContacts = await cleaningCompanyContact(
            data.id as number,
            submission.value.contacts,
          );

          if (idsToDeleteContacts.length > 0) {
            await tx.companyContact.updateMany({
              where: { id: { in: idsToDeleteContacts } },
              data: {
                active: false,
                deleted_at: new Date(),
              },
            });
          }

          // Handle updates and new creations
          for (const c of submission.value.contacts) {
            if (c.id) {
              await tx.companyContact.update({
                where: { id: Number(c.id) },
                data: {
                  contact_type: { connect: { id: Number(c.contact_type) } },
                  primary: c.primary === "1",
                  description: c.description,
                },
              });
            } else {
              await tx.companyContact.create({
                data: {
                  company: { connect: { id: data.id as number } },
                  contact_type: { connect: { id: Number(c.contact_type) } },
                  primary: c.primary === "1",
                  description: c.description,
                },
              });
            }
          }
        }

        if (submission.value.contact_persons) {
          // --- 2. HANDLE CONTACT PERSONS ---
          const idsToDeleteContactPersons = await cleaningCompanyContactPerson(
            data.id as number,
            submission.value.contact_persons,
          );

          if (idsToDeleteContactPersons.length > 0) {
            await tx.companyContactPerson.updateMany({
              where: { id: { in: idsToDeleteContactPersons } },
              data: {
                active: false,
                deleted_at: new Date(),
              },
            });
          }

          // Handle updates and new creations
          for (const p of submission.value.contact_persons) {
            if (p.id) {
              await tx.companyContactPerson.update({
                where: { id: Number(p.id) },
                data: {
                  salutation: { connect: { id: Number(p.salutation) } },
                  first_name: p.first_name,
                  last_name: p.last_name,
                  phone_number: p.phone_number,
                  email: p.email,
                },
              });
            } else {
              await tx.companyContactPerson.create({
                data: {
                  company: { connect: { id: data.id as number } },
                  salutation: { connect: { id: Number(p.salutation) } },
                  first_name: p.first_name,
                  last_name: p.last_name,
                  phone_number: p.phone_number,
                  email: p.email,
                },
              });
            }
          }
        }

        await tx.company.update({
          where: { id: data.id as number },
          data: prismaData,
        });

        await logActivity({
          request,
          action: "Mengubah master company profile",
          category: "Data Master",
        });
      });
    }

    return redirectWithDialog(`/app/setting/company`, {
      title: "Berhasil",
      type: "success",
      description: "Berhasil menambahkan data company profile",
    });
  } catch (error) {
    let response: Response;
    let message: string = "Silahkan coba beberapa saat lagi";
    if (error instanceof BadRequestError) {
      message = error.message;
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

    if (error instanceof Error) {
      message = error.message;
    }

    Sentry.captureException(new Error("Unknown error occurred"));
    response = new Response(JSON.stringify(request), {
      headers: await createDialogHeaders({
        type: "error",
        title: "Terjadi Kesalahan",
        description: message,
        confirmText: "Coba Lagi",
      }),
    });

    return response;
  }
};

const cleaningCompanyContact = async (companyId: number, payload: Contact) => {
  const companyContact = await prisma.companyContact.findMany({
    where: {
      active: true,
      deleted_at: null,
      company_id: companyId,
    },
  });

  const data: number[] = [];

  companyContact.forEach((r) => {
    payload.forEach((p) => {
      if (Number(p.contact_type) !== r.contact_type_id) {
        data.push(r.id);
      }
    });
  });

  return data;
};

const cleaningCompanyContactPerson = async (
  companyId: number,
  payload: ContactPerson,
) => {
  const companyContactPerson = await prisma.companyContactPerson.findMany({
    where: {
      active: true,
      deleted_at: null,
      company_id: companyId,
    },
  });

  const data: number[] = [];

  companyContactPerson.forEach((r) => {
    payload.forEach((p) => {
      if (Number(p.salutation) !== r.salutation_id) {
        data.push(r.id);
      }
    });
  });

  return data;
};
