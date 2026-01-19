import { getFormProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Button, Grid } from "@mantine/core";
import { ActionFunctionArgs } from "@remix-run/node";
import {
  Form,
  useActionData,
  useNavigate,
  useNavigation,
} from "@remix-run/react";

import AuthCardForm from "~/components/card/auth-card-form";
import InputText from "~/components/form/input-text";

import { actionHandler } from "./action";
import { schema } from "./schema";

export const action = ({ request }: ActionFunctionArgs) =>
  actionHandler(request);

function ForgotPasswordPage() {
  const lastResult = useActionData<typeof action>();

  const navigation = useNavigation();
  const navigate = useNavigate();

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
        title="Ganti kata sandi"
        description="Masukkan email yang terdaftar sebelumnya"
      >
        <Form method="POST" {...getFormProps(form)}>
          <div className="flex flex-col gap-2">
            <Grid>
              <Grid.Col>
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
            </Grid>

            <Button
              type="submit"
              size="md"
              color="tmBlue"
              fullWidth
              className="mt-6"
              loading={navigation.state !== "idle"}
            >
              Kirim
            </Button>

            <Button
              type="button"
              size="md"
              variant="outline"
              color="tmGray.8"
              onClick={() => navigate("/auth")}
              fullWidth
              className="mt-6 border border-tm-gray-400"
              loading={navigation.state !== "idle"}
            >
              <Icon icon="tabler:arrow-left" className="mx-3" />
              Kembali
            </Button>
          </div>
        </Form>
      </AuthCardForm>
    </div>
  );
}

export default ForgotPasswordPage;
