import { ActionFunctionArgs } from "@remix-run/node";

import updateIdentityFileActionHandler from "./action";

export const action = (request: ActionFunctionArgs["request"]) => {
  return updateIdentityFileActionHandler(request);
};
