import { ActionFunctionArgs } from "@remix-run/node";

import actionHandler from "./action";

export const action = async (args: ActionFunctionArgs) => {
  return await actionHandler({ ...args });
};
