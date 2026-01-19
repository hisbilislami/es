import { getFormProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { Button } from "@mantine/core";
import { ActionFunctionArgs } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import * as Sentry from "@sentry/remix";
import { z } from "zod";

import AuthCardForm from "~/components/card/auth-card-form";
import InputPin from "~/components/form/input-pin";
import { qSendOtp } from "~/task/send-otp.server";
import { prisma } from "~/utils/db.server";
import { createDialogHeaders, redirectWithDialog } from "~/utils/dialog.server";
import { BadRequestError } from "~/utils/error.server";
import { logActivity } from "~/utils/log-activity.server";
import { verifyOTP } from "~/utils/otp";
import { registrationSessionStorage } from "~/utils/session.server";

const otpSchema = z.object({
  otp: z
    .string({ required_error: "Kode OTP harus diisi" })
    .min(6, { message: "Kode OTP harus diisi minimal 6 digit" }),
});

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const actionType = formData.get("_action");

  try {
    const session = await registrationSessionStorage.getSession(
      request.headers.get("Cookie"),
    );
    const email = session.get("email");

    if (!email) {
      throw new BadRequestError("Bad Request", {
        title: "Gagal",
        description: "Session telah kalauarsa. Silakan coba kembali",
      });
    }

    if (actionType === "verify") {
      const submission = parseWithZod(formData, { schema: otpSchema });

      if (submission.status !== "success") {
        return submission.reply();
      }

      const { otp } = submission.value;

      const isValid = await verifyOTP(email, otp);

      if (!isValid) {
        throw new BadRequestError("Bad Request", {
          title: "Gagal",
          description: "OTP tidak valid atau telah kadaluarsa.",
        });
      }

      await prisma.user.update({
        where: { email: email },
        data: {
          email_verified: true,
        },
      });

      session.unset("email"); // Clear email from session after verification

      await logActivity({
        request,
        category: "System",
        action: "Verifikasi OTP",
      });

      return redirectWithDialog(
        "/auth",
        {
          title: "Verifikasi berhasil",
          description: "Silakan login menggunakan akun anda.",
        },
        {
          headers: {
            "Set-Cookie":
              await registrationSessionStorage.commitSession(session),
          },
        },
      );
    }

    if (actionType === "resend") {
      await qSendOtp.add("re-sending the otp", { email });

      return new Response(JSON.stringify(request), {
        headers: await createDialogHeaders({
          title: "Verifikasi Email",
          icon: "/images/alert-feedback.svg",
          description: "Buka email untuk verifikasi email anda.",
        }),
      });
    }

    throw new BadRequestError("Bad Request", {
      title: "Gagal",
      description: "Aksi tidak valid",
    });
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
}

export default function OtpPage() {
  const actionData = useActionData<typeof action>();

  const [form, fields] = useForm({
    lastResult: actionData,
    constraint: getZodConstraint(otpSchema),
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: otpSchema });
    },
  });

  return (
    <div className="flex flex-col items-center justify-center h-screen w-full">
      <AuthCardForm
        title="Verifikasi OTP"
        description="Masukkan kode OTP berikut"
      >
        <Form method="POST" {...getFormProps(form)} className="mt-4">
          <div className="flex justify-center gap-2">
            <InputPin
              size="md"
              type="number"
              length={6}
              name={fields.otp.name}
              fields={fields}
            />
          </div>

          <Button
            type="submit"
            name="_action"
            value="verify"
            fullWidth
            size="md"
            className="mt-6 font-light"
          >
            Verifikasi
          </Button>
        </Form>

        <Form method="POST" className="inline">
          <Button
            type="submit"
            name="_action"
            value="resend"
            fullWidth
            size="md"
            variant="transparent"
            className="mt-2 font-light"
          >
            Kirim Ulang Kode
          </Button>
        </Form>
      </AuthCardForm>
    </div>
  );
}
