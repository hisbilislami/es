import { parseWithZod } from "@conform-to/zod";
import { Prisma } from "@prisma/client";
import { ActionFunctionArgs } from "@remix-run/node";
import * as Sentry from "@sentry/remix";
import mime from "mime-types";

import { getUserId, requireUserId } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { createDialogHeaders, redirectWithDialog } from "~/utils/dialog.server";
import { BadRequestError } from "~/utils/error.server";
import { storeFile, UploadType } from "~/utils/file-uploads.server";
import { logActivity } from "~/utils/log-activity.server";
import { getTenantId } from "~/utils/session.server";

import { identityItem } from "./schema/identity.schema";
import { organizationItem } from "./schema/organization.schema";
import { personalInformationSchema } from "./schema/personal-information.schema";

export const actionHandler = async (request: ActionFunctionArgs["request"]) => {
  try {
    await requireUserId(request);

    const userId = await getUserId(request);
    if (!userId) throw new Error("Unauthorized");

    const tenant = await getTenantId(request);
    if (!tenant.tenantId) throw new Error("Unauthorized");

    const formData = await request.formData();

    // const checkUnique = <T extends "code" | "phone_number" | "email">(
    //   field: T,
    // ) => {
    //   return async (value: string) => {
    //     if (!value?.trim()) return true;
    //
    //     const where = { [field]: value } as Record<T, string>;
    //
    //     const exists = await prisma.person.findUnique({
    //       where: where as Prisma.PersonWhereUniqueInput,
    //     });
    //
    //     if (exists && !formData.get("id")) {
    //       return true;
    //     }
    //     return false;
    //   };
    // };

    const submission = parseWithZod(formData, {
      schema: personalInformationSchema,
    });

    if (submission.status !== "success") {
      return submission.reply();
    }

    const opt = submission.value?.id ? "update" : "new";

    const { createPersonIdentities, updatePersonIdentities } =
      await buildPersonIdentities({
        identities: submission.value.identities,
        userId,
        tenantId: tenant.tenantId,
      });

    const person: Record<string, unknown> = {
      name: submission.value.name,
      medical_record_number: submission.value.medical_record_number,
      gender: submission.value.gender,
      place_of_birth: submission.value.place_of_birth,
      date_of_birth: submission.value.date_of_birth
        ? new Date(submission.value.date_of_birth)
        : null,
      type: submission.value.type,
      email: submission.value.email,
      phone_number: submission.value.phone,
      address: submission.value.address,
      subdistrict: {
        connect: {
          id: Number(submission.value.subdistrict),
        },
      },
    };

    if (opt === "new") {
      const personData: Prisma.PersonCreateInput =
        person as Prisma.PersonCreateInput;

      if (submission.value.identities) {
        personData.person_identity = { create: createPersonIdentities };
      }

      if (submission.value.type === "employee") {
        const { createEmployee } = await buildCompanyEmployee({
          organization: {
            company_employee_id: submission.value.company_employee_id,
            company: submission.value.company,
            working_unit: submission.value.working_unit,
            job_position: submission.value.job_position,
            employee_number: submission.value.employee_number,
            practitioner_number: submission.value.practitioner_number,
          },
        });

        personData.company_employee = { create: createEmployee };
      }

      await prisma.$transaction(async (tx) => {
        await tx.person.create({
          data: personData,
        });

        await logActivity({
          request,
          action: "Membuat master user signer",
          category: "Data Master",
        });
      });
    } else {
      const getPersonId = await prisma.person.findFirst({
        where: { id: submission.value.id as number },
      });

      if (!getPersonId) {
        throw new BadRequestError("Bad Request", {
          title: "Gagal",
          description: "Data person tidak ditemukan.",
        });
      }

      const prismaData: Prisma.PersonUpdateInput =
        person as Prisma.PersonUpdateInput;

      await prisma.$transaction(async (tx) => {
        if (submission.value.identities) {
          const idsToDeleteIdentities = await cleaningIdentities(
            getPersonId.id as number,
            submission.value.identities,
          );

          prismaData.person_identity = {
            ...(createPersonIdentities.length && {
              create: createPersonIdentities,
            }),
            ...(updatePersonIdentities.length && {
              update: updatePersonIdentities,
            }),
            ...(idsToDeleteIdentities.length && {
              updateMany: {
                where: { id: { in: idsToDeleteIdentities } },
                data: {
                  active: false,
                  deleted_at: new Date(),
                },
              },
            }),
          };
        }

        if (submission.value.type === "employee") {
          if (submission.value.company_employee_id) {
            const { updateEmployee } = await buildCompanyEmployee({
              organization: {
                company_employee_id: submission.value.company_employee_id,
                company: submission.value.company,
                working_unit: submission.value.working_unit,
                job_position: submission.value.job_position,
                employee_number: submission.value.employee_number,
                practitioner_number: submission.value.practitioner_number,
              },
            });
            prismaData.company_employee = {
              update: updateEmployee,
            };
          } else {
            const { createEmployee } = await buildCompanyEmployee({
              organization: {
                company_employee_id: submission.value.company_employee_id,
                company: submission.value.company,
                working_unit: submission.value.working_unit,
                job_position: submission.value.job_position,
                employee_number: submission.value.employee_number,
                practitioner_number: submission.value.practitioner_number,
              },
            });

            prismaData.company_employee = { create: createEmployee };
          }
        }

        await tx.person.update({
          where: { id: getPersonId.id as number },
          data: prismaData,
        });

        await logActivity({
          request,
          action: "Mengubah master user signer",
          category: "Data Master",
        });
      });
    }

    return redirectWithDialog(`/app/setting/user-signer`, {
      title: "Berhasil",
      type: "success",
      description: "Berhasil menambahkan data user signer",
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

const cleaningIdentities = async (
  personId: number,
  payload: identityItem[],
) => {
  const personIdentities = await prisma.personIdentity.findMany({
    where: {
      active: true,
      deleted_at: null,
      person_id: personId,
    },
  });

  const data: number[] = [];

  personIdentities.forEach((r) => {
    payload.forEach((p) => {
      if (p.id && Number(p.id) !== r.id) {
        data.push(r.id);
      }
    });
  });

  return data;
};

type UploadLocalType = {
  buffer: Buffer;
  name?: string;
  type: string;
  size: number;
  userId: string;
  tenantId: string;
};

export const uploadFile = async ({
  buffer,
  name,
  type,
  size,
  userId,
  tenantId,
}: UploadLocalType) => {
  const mimeType = mime.lookup(String(name));
  const ext = mime.extension(type);

  if (!mimeType || !ext) {
    throw new Error(`Invalid file type for ${name}`);
  }

  // Reconstruct the file as a Blob/File
  const file = new File([buffer], String(name), { type });

  const fileUrl = await storeFile(file, UploadType.IMAGE, tenantId, userId);

  const storedFile = await prisma.files.create({
    data: {
      key: fileUrl.filename,
      size,
      extension: ext,
      origin_name: name,
      mime_type: mimeType,
    },
  });

  return {
    id: storedFile.id,
    key: storedFile.key,
  };
};

async function buildPersonIdentities({
  identities,
  userId,
  tenantId,
}: {
  identities?: identityItem[];
  userId: string;
  tenantId: string;
}): Promise<{
  createPersonIdentities: Prisma.PersonIdentityCreateWithoutPersonInput[];
  updatePersonIdentities: Prisma.PersonIdentityUpdateWithWhereUniqueWithoutPersonInput[];
}> {
  if (!identities?.length)
    return { createPersonIdentities: [], updatePersonIdentities: [] };

  const createPersonIdentities: Prisma.PersonIdentityCreateWithoutPersonInput[] =
    [];
  const updatePersonIdentities: Prisma.PersonIdentityUpdateWithWhereUniqueWithoutPersonInput[] =
    [];

  for (const r of identities) {
    let fileId: number | undefined;

    if (r.file_identity && r.file_identity instanceof File) {
      const file = r.file_identity;
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const upload = await uploadFile({
        buffer,
        name: r.file_identity_name,
        type: file.type,
        size: file.size,
        userId,
        tenantId,
      });

      fileId = upload.id;
    }

    const baseData = {
      identity: { connect: { id: Number(r.identity_type) } },
      number: r.number,
      issuer: r.issuer,
      issuer_country: { connect: { id: Number(r.country_issuer) } },
      ...(fileId && { file_identity: { connect: { id: fileId } } }),
      expired_date: r.expired_date,
      primary: r.primary === "y" ? true : false,
    };

    if (r.id) {
      updatePersonIdentities.push({
        where: { id: Number(r.id) },
        data: baseData,
      });
    } else {
      createPersonIdentities.push(baseData);
    }
  }

  return { createPersonIdentities, updatePersonIdentities };
}

const buildCompanyEmployee = async ({
  organization,
}: {
  organization?: organizationItem;
}): Promise<{
  createEmployee: Prisma.CompanyEmployeeCreateWithoutPersonInput | undefined;
  updateEmployee:
    | Prisma.CompanyEmployeeUpdateWithWhereUniqueWithoutPersonInput
    | undefined;
}> => {
  if (!organization)
    return { createEmployee: undefined, updateEmployee: undefined };

  let createEmployee:
    | Prisma.CompanyEmployeeCreateWithoutPersonInput
    | undefined = undefined;
  let updateEmployee:
    | Prisma.CompanyEmployeeUpdateWithWhereUniqueWithoutPersonInput
    | undefined = undefined;

  const baseData = {
    company: {
      connect: {
        id: Number(organization.company),
      },
    },
    working_unit: {
      connect: {
        id: Number(organization.working_unit),
      },
    },
    job_position: {
      connect: {
        id: Number(organization.job_position),
      },
    },
    employee_number: organization.employee_number,
    practitioner_number: organization.practitioner_number,
  };

  if (!organization.company_employee_id) {
    createEmployee = baseData;
  } else {
    updateEmployee = {
      where: { id: Number(organization.company_employee_id) },
      data: baseData,
    };
  }

  return { createEmployee, updateEmployee };
};
