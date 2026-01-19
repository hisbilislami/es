import { Button } from "@mantine/core";
import { ActionFunctionArgs } from "@remix-run/node";
import { Form } from "@remix-run/react";

import GeneralErrorBoundary from "~/components/error-boundary/general-error-boundary";
import { useDialog } from "~/context/DialogContext";
import { redirectWithDialog } from "~/utils/dialog.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  if (request.method === "PATCH") {
    throw new Response("Sentry, Terjadi Kesalahan", {
      status: 500,
    });
  }

  return await redirectWithDialog("/auth/otp", {
    title: "success to redirect",
    description: "seem it working well, currently version: " + process.version,
  });
};

const Hello = () => {
  const { showDialog } = useDialog();

  const showMessages = () => {
    showDialog({
      title: "Information",
      description: "This is comes from client code",
    });
  };

  return (
    <div className="flex flex-col gap-3 items-center justify-center h-full w-full">
      <Form method="post" className="flex flex-col gap-3">
        <Button type="submit">submit</Button>
        <Button onClick={showMessages} type="button">
          On Click Test
        </Button>
      </Form>

      <Form method="PATCH">
        <Button type="submit" color="red.5">
          submit error
        </Button>
      </Form>
    </div>
  );
};

export default Hello;

export function ErrorBoundary() {
  return <GeneralErrorBoundary />;
}
