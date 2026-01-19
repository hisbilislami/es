import { ActionFunctionArgs } from "@remix-run/node"; // 🔥 Removed unused `ActionFunction`
import * as Sentry from "@sentry/remix";
import { authenticateClientRequest } from "~/utils/auth.server";
import { RequestBody, schema, Signers } from "./constant";
import { prisma } from "~/utils/db.server";
import { Prisma } from "@prisma/client";

export const action = async ({ request }: ActionFunctionArgs) => {
  await authenticateClientRequest(request);

  if (request.method !== "POST") {
    Sentry.captureException(new Error("Method not allowed"));
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const rawBody = await request.json();

    const schemaValidation = schema.safeParse(rawBody);
    if (!schemaValidation.success) {
      throw new Error(JSON.stringify(schemaValidation.error.format(), null, 2));
    }

    const body: RequestBody = schemaValidation.data;

    const document = await prisma.document.findFirst({
      where: {
        reference_number: body.reference_number,
        registration_number: body.registration_number,
      },
    });

    const opt = document ? "update" : "new";

    const doctor = body.signers.filter((s) => s.position === "practitioner");
    const patient = body.signers.filter((s) => s.position === "patient");

    const doctorData = await prisma.user.findFirst({
      where: {
        email: doctor?.[0].email,
        person: {
          nik: doctor?.[0].entity_number,
        },
      },
      include: {
        person: true,
      },
    });

    if (!doctorData) {
      throw new Error(
        "No practitioner data found. Please go to the Registration page.",
      );
    }

    const documentData: Record<string, any> = {
      reference_number: body.reference_number,
      name: body.name,
      date: new Date(body.document_date),
      registration_number: body.registration_number,
      patient_name: patient?.[0].name,
      file_url: body.document_url,
      active: true,
    };

    const prismaData: Prisma.DocumentCreateInput =
      documentData as Prisma.DocumentCreateInput;

    let documentId: number;

    if (opt === "new") {
      const createdDocument = await prisma.document.create({
        data: prismaData,
      });
      documentId = createdDocument.id;
    } else {
      if (!document) {
        throw new Error("Document expected but not found during update.");
      }
      documentId = document.id;
      await prisma.document.update({
        where: { id: documentId },
        data: prismaData,
      });
    }

    const existingDocumentStatus = await prisma.relDocumentStatus.findMany({
      where: {
        document_id: documentId,
      },
    });

    const existingStatus = await prisma.status.findFirst({
      where: {
        name: "pending",
        active: true,
        deleted_at: null,
      },
    });

    let statusId = null;

    if (existingStatus) {
      statusId = existingStatus.id;
    } else {
      const statusCreated = await prisma.status.create({
        data: {
          name: "pending",
        },
      });
      statusId = statusCreated.id;
    }

    if (existingDocumentStatus.length > 0) {
      for (const documentStatus of existingDocumentStatus) {
        await prisma.relDocumentStatus.update({
          where: { id: documentStatus.id },
          data: { active: false, deleted_at: new Date() },
        });
      }
    }

    await prisma.relDocumentStatus.create({
      data: {
        document_id: documentId,
        status_id: statusId,
      },
    });

    const existingSigners = await prisma.signer.findMany({
      where: {
        document_id: documentId,
        practitioner_id: doctorData.id,
        active: true,
        deleted_at: null,
      },
    });

    if (existingSigners.length > 0) {
      /* update */
      for (const signer of existingSigners) {
        if (signer.type === "practitioner") {
          await prisma.signer.update({
            where: { id: signer.id },
            data: {
              name: doctorData.person.name,
              email: doctorData.email,
              type: "practitioner",
              document_id: documentId,
              practitioner_id: doctorData.id,
            },
          });
        }
        if (signer.type === "patient") {
          await prisma.signer.update({
            where: { id: signer.id },
            data: {
              name: patient?.[0].name,
              email: patient?.[0].email,
              type: "patient",
              document_id: documentId,
              practitioner_id: null,
            },
          });
        }
      }
    } else {
      /* insert */
      await prisma.$transaction(async (tx) => {
        await tx.signer.create({
          data: {
            name: doctorData.person.name,
            email: doctorData.email,
            type: "practitioner",
            document_id: documentId,
            practitioner_id: doctorData.id,
          },
        });

        await tx.signer.create({
          data: {
            name: patient?.[0].name,
            email: patient?.[0].email,
            type: "patient",
            document_id: documentId,
            practitioner_id: null,
          },
        });
      });
    }

    return new Response(
      JSON.stringify({
        message: "Data sent successfully.",
        document_id: documentId,
      }),
      { status: 200 },
    );
  } catch (error) {
    Sentry.captureException(error);
    return new Response(
      error instanceof Error ? error.message : "Internal Server Error",
      { status: 400 },
    );
  }
};
