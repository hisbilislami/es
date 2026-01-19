import { getFormProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { Button, Grid, Text } from "@mantine/core";
import { ActionFunctionArgs } from "@remix-run/node";
import {
  Form,
  Link,
  useActionData,
  useNavigation,
  useSearchParams,
} from "@remix-run/react";

import AuthCardForm from "~/components/card/auth-card-form";
import InputPassword from "~/components/form/input-password";

import { actionHandler } from "./action";
import { formLabel, schema } from "./schema";

export const action = ({ request }: ActionFunctionArgs) => {
  return actionHandler(request);
};

const ResetPasswordPage = () => {
  const navigation = useNavigation();

  const lastResult = useActionData<typeof action>();

  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [form, fields] = useForm({
    lastResult: lastResult,
    constraint: getZodConstraint(schema),
    shouldRevalidate: "onInput",
    shouldValidate: "onBlur",
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
    },
    defaultValue: {
      password: "",
      confirm_password: "",
      token: token || "",
    },
  });

  return (
    <div className="mx-auto flex flex-col justify-center items-center h-full w-full">
      <AuthCardForm
        title="Ganti kata sandi"
        description="Gunakan kata sandi yang berbeda."
      >
        <Form method="post" {...getFormProps(form)}>
          <div className="flex flex-col gap-2">
            <Grid>
              <Grid.Col>
                <InputPassword {...formLabel["password"]} fields={fields} />
                <InputPassword
                  {...formLabel["confirm_password"]}
                  fields={fields}
                />
                <input
                  type="hidden"
                  name={fields.token.name}
                  value={fields.token.value}
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
              Simpan
            </Button>
            <Text className="text-center text-sm mt-6">
              Kembali ke halaman{" "}
              <Link
                to="/auth"
                className="font-semibold hover:underline hover:text-tm-blue-600"
              >
                masuk
              </Link>
            </Text>
          </div>
        </Form>
      </AuthCardForm>
    </div>
  );
};

export default ResetPasswordPage;
