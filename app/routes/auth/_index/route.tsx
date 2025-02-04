import { Icon } from "@iconify/react/dist/iconify.js";
import {
  TextInput,
  PasswordInput,
  Button,
  Text,
  Card,
  Checkbox,
} from "@mantine/core";
import { Form, Link, useActionData, useNavigation } from "@remix-run/react";
import TrustmedisSignLogo from "~/components/logo/trustmedis-sign-logo";
import { z } from "zod";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { getFormProps, useForm } from "@conform-to/react";
import { prisma } from "~/utils/db.server";
import bcrypt from "bcryptjs";
import { redirectWithToast } from "~/utils/toast.server";
import { createUserSession } from "~/utils/session.server";
import { requireAnonymous } from "~/utils/auth.server";

const schema = z.object({
  username: z.string({ required_error: "Email is required" }),
  password: z
    .string({ required_error: "Password is required" })
    .min(5, "Password is too short")
    .max(16, "Password is too long"),
});

export async function action({ request }: ActionFunctionArgs) {
  await requireAnonymous(request);
  const formData = await request.formData();

  const submission = parseWithZod(formData, { schema });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const userWithPassword = await prisma.user.findUnique({
    where: { username: submission.value.username },
  });

  if (!userWithPassword || !userWithPassword.password) {
    throw await redirectWithToast("/auth", {
      type: "error",
      title: "Kredensial tidak sesuai",
      description: "Tidak bisa menemukan pengguna, coba lagi",
    });
  }

  const isValid = await bcrypt.compare(
    submission.value.password,
    userWithPassword.password
  );

  if (!isValid) {
    throw await redirectWithToast("/auth", {
      type: "error",
      title: "Kredensial tidak sesuai",
      description: "Username atau password tidak sesuai, coba lagi.",
    });
  }

  return await createUserSession({
    request,
    redirectTo: "/dashboard",
    userId: userWithPassword.id,
    userCred: {
      username: userWithPassword.username,
      email: userWithPassword.email,
    },
  });
}

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAnonymous(request);
  return {};
}

function LoginPage() {
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
      <div className="bg-tm-green-600 rounded-t-3xl pt-4 pb-12 px-11 w-2/4 lg:w-3/5 z-20">
        <Text className="text-white text-xl" fw={600}>
          Masuk Trustmedis Sign
        </Text>
      </div>
      <Card className="flex flex-col gap-6 w-2/4 lg:w-3/5 bg-white rounded-3xl p-11 z-30 -translate-y-8">
        <TrustmedisSignLogo />
        <Form method="POST" {...getFormProps(form)}>
          <div className="flex flex-col gap-6">
            <TextInput
              label="Username"
              placeholder="Masukkan username"
              autoComplete="off"
              aria-label="username"
              name={fields.username.name}
              withAsterisk
              error={fields.username?.errors?.[0] || ""}
              leftSection={<Icon icon="tabler:user" className="h-4 w-4" />}
            />

            <PasswordInput
              label="Kata Sandi"
              withAsterisk
              placeholder="Masukkan Kata Sandi"
              aria-label="password"
              name={fields.password.name}
              error={fields.password.errors?.[0] || ""}
              leftSection={<Icon icon="tabler:lock" className="h-4 w-4" />}
            />

            <div className="flex justify-between">
              <Checkbox label="Ingat Saya" />

              <Link to="/auth/forgot-password">
                <Text className="text-right">Lupa Kata Sandi?</Text>
              </Link>
            </div>

            <Button
              type="submit"
              size="lg"
              color="tmBlue"
              fullWidth
              className="mt-3"
              loading={navigation.state !== "idle"}
            >
              Masuk
            </Button>

            <Text className="text-center">
              Belum punya akun?{" "}
              <Link to="/register" className="font-semibold">
                Daftar
              </Link>
            </Text>
          </div>
        </Form>
      </Card>
    </div>
  );
}

export default LoginPage;
