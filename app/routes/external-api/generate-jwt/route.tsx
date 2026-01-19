import { ActionFunctionArgs, data } from "@remix-run/node";
import * as Sentry from "@sentry/remix";
import { generateJwtToken } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";

interface RequestBody {
  client_id?: string;
  api_key?: string;
}

export const action = async ({ request }: ActionFunctionArgs) => {
  if (request.method !== "POST") {
    Sentry.captureException(new Error("Method not allowed"));
    return new Response("Method not allowed", { status: 400 });
  }

  try {
    const body: RequestBody = await request.json();
    const clientId = body.client_id;
    const apiKey = body.api_key;

    if (!clientId || !apiKey) {
      throw new Error("Missing client ID or API Key");
    }

    const client = await prisma.client.findUnique({
      where: {
        client_id: clientId,
        api_key: apiKey,
        active: true,
        deleted_at: null,
      },
    });

    if (!client) {
      throw new Error("Missing client ID or API Key");
    }

    const token = await generateJwtToken({ clientId, apiKey });
    return new Response(JSON.stringify({ token }), { status: 200 });
  } catch (error) {
    let response: Response;
    if (error instanceof Error) {
      Sentry.captureException(error);
      response = new Response(error.message, { status: 400 });

      return response;
    }
  }
};
