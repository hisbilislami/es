import { TextInput, PasswordInput, Button, Text, Card } from "@mantine/core";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import TrustmedisSignLogo from "~/components/logo/trustmedis-sign-logo";
import { z } from "zod";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { getFormProps, useForm } from "@conform-to/react";
import { prisma } from "~/utils/db.server";
import bcrypt from "bcryptjs";
import { redirectWithToast } from "~/utils/toast.server";
import { requireAnonymous } from "~/utils/auth.server";

const schema = z
  .object({
    nik: z.string().regex(/^\d{16,}$/, {
      message: "NIK must be at least 16 digits",
    }),
    name: z
      .string()
      .min(3, { message: "Full name must be at least 3 characters long" }),
    email: z.string().email({ message: "Invalid email format" }),
    username: z
      .string()
      .min(3, { message: "Username must be at least 3 characters long" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long" }),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
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

    // ✅ Check if email already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw await redirectWithToast("/registration", {
        type: "error",
        title: "Error",
        description: "Email has been registered",
      });
    }

    // First, create a Person record
    const person = await prisma.person.create({
      data: { nik, name },
    });

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Then, create the User record and associate it with the Person
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        person_id: person.id, // Link the User to the Person by person_id
      },
    });

    return { success: true, user };
  } catch (error) {
    return { success: false, error };
  }
}

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAnonymous(request);
  return {};
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
      <div className="bg-tm-green-600 rounded-t-3xl pt-4 pb-12 px-11 w-2/4 lg:w-3/5 z-20">
        <Text className="text-white text-xl" fw={600}>
          Registration Trustmedis Sign
        </Text>
      </div>
      <Card className="flex flex-col gap-6 w-2/4 lg:w-3/5 bg-white rounded-3xl p-11 z-30 -translate-y-8">
        <TrustmedisSignLogo />
        <Form method="POST" {...getFormProps(form)}>
          <div className="flex flex-col gap-2">
            <TextInput
              label="NIK"
              placeholder="NIK"
              autoComplete="off"
              aria-label="nik"
              name={fields.nik.name}
              withAsterisk
              error={fields.nik?.errors?.[0] || ""}
            />

            <TextInput
              label="Nama Lengkap"
              placeholder="Nama Lengkap"
              autoComplete="off"
              aria-label="name"
              name={fields.name.name}
              withAsterisk
              error={fields.name?.errors?.[0] || ""}
            />

            <TextInput
              label="Email"
              placeholder="Email"
              autoComplete="off"
              aria-label="email"
              name={fields.email.name}
              withAsterisk
              error={fields.email?.errors?.[0] || ""}
            />

            <TextInput
              label="Username"
              placeholder="Username"
              autoComplete="off"
              aria-label="username"
              name={fields.username.name}
              withAsterisk
              error={fields.username?.errors?.[0] || ""}
            />

            <PasswordInput
              label="Kata Sandi"
              withAsterisk
              placeholder="Minimum 8 Karakter"
              aria-label="password"
              name={fields.password.name}
              error={fields.password.errors?.[0] || ""}
            />

            <PasswordInput
              label="Konfirmasi Kata Sandi"
              withAsterisk
              placeholder="Minimum 8 Karakter"
              aria-label="config-password"
              name={fields.confirm_password.name}
              error={fields.confirm_password.errors?.[0] || ""}
            />

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
          </div>
        </Form>
      </Card>
    </div>
  );
}

export default RegistrationPage;
