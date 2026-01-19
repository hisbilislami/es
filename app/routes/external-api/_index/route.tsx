import { ActionFunction, LoaderFunction } from "@remix-run/node";
import { authenticateClientRequest } from "~/utils/auth.server";

export const loader: LoaderFunction = async ({ request }) => {
  await authenticateClientRequest(request);

  return {
    message: "hello loader",
  };
};

export const action: ActionFunction = async ({ request }) => {
  await authenticateClientRequest(request);

  return {
    message: "hello action",
  };
};
