import { peruriApiFetch } from "~/utils/peruri/peruri-service.server";

type SendSpecimentData = {
  email: string;
  systemId: string;
  speciment: string;
};

async function sendSpeciment(body: SendSpecimentData, request: Request) {
  try {
    const res = await peruriApiFetch(
      "/digitalSignatureFullJwtSandbox/1.0/sendSpeciment/v1",
      {
        body: {
          param: body,
        },
        method: "POST",
      },
      request,
    );

    return res;
  } catch (error) {
    throw new Error("Something when wrong");
  }
}

export default sendSpeciment;
