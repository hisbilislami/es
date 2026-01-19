import { getFormProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Button, Text } from "@mantine/core";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  Form,
  Link,
  MetaFunction,
  useActionData,
  useNavigation,
} from "@remix-run/react";

import AuthCardForm from "~/components/card/auth-card-form";
import GeneralErrorBoundary from "~/components/error-boundary/general-error-boundary";
import InputCheckbox from "~/components/form/input-checkbox";
import InputPassword from "~/components/form/input-password";
import InputText from "~/components/form/input-text";
import { requireAnonymous } from "~/utils/auth.server";
import { createMetaTitle } from "~/utils/page-meta";

import actionHandler from "./action";
import { loginFormSchema } from "./schema";

export const meta: MetaFunction = ({ matches }) => {
  const title = createMetaTitle({ matches, title: "Login" });
  return [{ title }];
};

export async function action({ request }: ActionFunctionArgs) {
  return actionHandler(request);
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
    constraint: getZodConstraint(loginFormSchema),
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: loginFormSchema });
    },
  });

  return (
    <div className="mx-auto flex flex-col justify-center items-center h-full w-full">
      <AuthCardForm
        title="Masuk ke akun anda"
        description="Masukkan username & kata sandi untuk masuk"
      >
        <Form method="POST" {...getFormProps(form)}>
          <div className="flex flex-col gap-6">
            <InputText
              size="md"
              label="Username"
              placeholder="Masukkan username"
              autoComplete="off"
              aria-label="username"
              name={fields.username.name}
              fields={fields}
              withAsterisk
              leftSection={<Icon icon="tabler:user" className="h-5 w-5" />}
            />

            <InputPassword
              size="md"
              label="Kata Sandi"
              withAsterisk
              placeholder="Masukkan Kata Sandi"
              aria-label="password"
              name={fields.password.name}
              fields={fields}
              leftSection={<Icon icon="tabler:lock" className="h-5 w-5" />}
            />

            <div className="flex justify-between">
              <InputCheckbox
                label="Ingat Saya"
                name={fields.remember_me.name}
                fields={fields}
              />

              <Link to="/auth/forgot-password">
                <Text className="text-right text-sm font-normal hover:underline hover:text-tm-blue-600">
                  Lupa Kata Sandi?
                </Text>
              </Link>
            </div>

            <Button
              type="submit"
              size="md"
              color="tmBlue"
              fullWidth
              className="mt-3 font-normal"
              loading={navigation.state !== "idle"}
            >
              Masuk
            </Button>

            <Text className="text-center text-sm">
              Belum punya akun?{" "}
              <Link
                to="/auth/registration"
                className="font-semibold hover:underline hover:text-tm-blue-600"
              >
                Daftar
              </Link>
            </Text>
          </div>
        </Form>
      </AuthCardForm>
    </div>
  );
}

export default LoginPage;

export function ErrorBoundary() {
  return <GeneralErrorBoundary />;
}
