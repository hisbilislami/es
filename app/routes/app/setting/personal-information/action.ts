import { ActionFunctionArgs, data } from "@remix-run/node";

import { createDialogHeaders } from "~/utils/dialog.server";

import updateProfilePhotoActionHandler from "./profile-banner/action";
import handSignatureActionHandler from "./tab-hand-signature/action";
import personalInformationActionHandler from "./tab-personal-information/action";

export const actionHandler = async ({ request }: ActionFunctionArgs) => {
  const searchParams = new URL(request.url).searchParams;
  const currentTab = searchParams.get("tab") || "personal-information";

  if (currentTab === "hand-signature") {
    return handSignatureActionHandler(request);
  }

  if (currentTab === "personal-information") {
    return personalInformationActionHandler(request);
  }

  if (currentTab === "profile-banner") {
    return updateProfilePhotoActionHandler(request);
  }

  return data(
    { success: false },
    {
      headers: await createDialogHeaders({
        title: "Terjadi Kesalahan",
        description: "Aksi yang anda minta tidak tersedia.",
        type: "error",
      }),
    },
  );
};
