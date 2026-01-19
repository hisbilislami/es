import { getFormProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { Button, Text, Grid } from "@mantine/core";
import { ActionFunctionArgs } from "@remix-run/node";
import { Form, Link, useActionData, useNavigation } from "@remix-run/react";
import * as Sentry from "@sentry/remix";
import bcrypt from "bcryptjs";
import { z } from "zod";

import AuthCardForm from "~/components/card/auth-card-form";
import InputNumber from "~/components/form/input-number";
import InputPassword from "~/components/form/input-password";
import InputText from "~/components/form/input-text";
import { qSendOtp } from "~/task/send-otp.server";
import { requireAnonymous } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { createDialogHeaders, redirectWithDialog } from "~/utils/dialog.server";
import { BadRequestError } from "~/utils/error.server";
import { logActivity } from "~/utils/log-activity.server";
import { registrationSessionStorage } from "~/utils/session.server";

const schema = z
  .object({
    nik: z.string().regex(/^\d{16}$/, {
      message: "NIK harus terdiri dari 16 digit",
    }),
    name: z.string().min(3, {
      message: "Nama lengkap harus terdiri dari minimal 3 karakter",
    }),
    email: z.string().email({ message: "Format email tidak valid" }),
    username: z.string().min(3, {
      message: "Nama pengguna harus terdiri dari minimal 3 karakter",
    }),
    password: z
      .string()
      .min(8, { message: "Kata sandi harus terdiri dari minimal 8 karakter" }),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Kata sandi tidak cocok",
    path: ["confirm_password"],
  });

export async function action({ request }: ActionFunctionArgs) {
  await requireAnonymous(request);

  const formData = await request.formData();

  try {
    const submission = parseWithZod(formData, { schema });

    if (submission.status !== "success") {
      return submission.reply();
    }

    const { nik, name, email, username, password } = submission.value;

    // Check if NIK, Email, or Username already exists (before transaction)
    const [existingPerson, existingUser, existingUsername] = await Promise.all([
      prisma.person.findFirst({ where: { nik } }),
      prisma.user.findUnique({ where: { email } }),
      prisma.user.findUnique({ where: { username } }),
    ]);

    if (existingPerson) {
      throw new BadRequestError("Bad Request", {
        title: "Gagal",
        description: "NIK telah terdaftar",
      });
    }

    if (existingUser) {
      throw new BadRequestError("Bad Request", {
        title: "Gagal",
        description: "Email telah terdaftar",
      });
    }

    if (existingUsername) {
      throw new BadRequestError("Bad Request", {
        title: "Gagal",
        description: "Username telah terdaftar",
      });
    }

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.$transaction(async (tx) => {
      const person = await tx.person.create({
        data: { nik, name },
      });

      await tx.user.create({
        data: {
          email,
          username,
          password: hashedPassword,
          person_id: person.id,
        },
      });

      await logActivity({
        request,
        category: "System",
        action: "Registrasi user",
      });
    });

    await qSendOtp.add("sending otp", {
      email,
    });

    const session = await registrationSessionStorage.getSession();
    session.set("email", email);

    return redirectWithDialog(
      `/auth/otp`,
      {
        title: "Verifikasi Email",
        icon: "/image/alert-feedback.svg",
        description: "Buka email untuk verifikasi email anda.",
      },
      {
        headers: {
          "Set-Cookie": await registrationSessionStorage.commitSession(session),
        },
      },
    );
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

function RegistrationPage() {
  const lastResult = useActionData<typeof action>();

  const navigation = useNavigation();

  const [form, fields] = useForm({
    lastResult,
    constraint: getZodConstraint(schema),
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
    },
  });

  return (
    <div className="mx-auto flex flex-col justify-center items-center h-full w-full">
      <AuthCardForm
        title="Daftar akun anda"
        description="Masukkan beberapa datan untuk daftar"
      >
        <Form method="POST" {...getFormProps(form)}>
          <div className="flex flex-col gap-2">
            <Grid>
              <Grid.Col span={6}>
                <InputNumber
                  size="md"
                  label="NIK"
                  placeholder="NIK"
                  autoComplete="off"
                  aria-label="nik"
                  fields={fields}
                  name={fields.nik.name}
                  withAsterisk
                  hideControls
                  valueIsNumericString
                  allowNegative={false}
                  allowLeadingZeros={true}
                  allowDecimal={false}
                />
              </Grid.Col>

              <Grid.Col span={6}>
                <InputText
                  label="Nama Lengkap"
                  placeholder="Nama Lengkap"
                  autoComplete="off"
                  aria-label="name"
                  withAsterisk
                  size="md"
                  name={fields.name.name}
                  fields={fields}
                />
              </Grid.Col>

              <Grid.Col span={6}>
                <InputText
                  label="Email"
                  placeholder="Email"
                  autoComplete="off"
                  aria-label="email"
                  name={fields.email.name}
                  withAsterisk
                  size="md"
                  fields={fields}
                />
              </Grid.Col>

              <Grid.Col span={6}>
                <InputText
                  label="Username"
                  placeholder="Username"
                  autoComplete="off"
                  aria-label="username"
                  name={fields.username.name}
                  withAsterisk
                  size="md"
                  fields={fields}
                />
              </Grid.Col>

              <Grid.Col span={6}>
                <InputPassword
                  label="Kata Sandi"
                  withAsterisk
                  autoComplete="off"
                  placeholder="Minimal 8 karakter"
                  aria-label="password"
                  size="md"
                  name={fields.password.name}
                  fields={fields}
                />
              </Grid.Col>

              <Grid.Col span={6}>
                <InputPassword
                  label="Konfirmasi Kata Sandi"
                  withAsterisk
                  autoComplete="off"
                  placeholder="Minimal 8 karakter"
                  aria-label="config-password"
                  size="md"
                  name={fields.confirm_password.name}
                  fields={fields}
                />
              </Grid.Col>
            </Grid>

            <Button
              type="submit"
              size="md"
              color="tmBlue"
              fullWidth
              className="mt-6"
              loading={navigation.state !== "idle"}
            >
              Daftar
            </Button>

            <Text className="text-center text-sm mt-6">
              Sudah punya akun?{" "}
              <Link
                to="/auth"
                className="font-semibold hover:underline hover:text-tm-blue-600"
              >
                Masuk
              </Link>
            </Text>
          </div>
        </Form>
      </AuthCardForm>
    </div>
  );
}

export default RegistrationPage;
