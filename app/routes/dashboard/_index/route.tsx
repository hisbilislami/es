import { Button } from "@mantine/core";
import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useRevalidator } from "@remix-run/react";
import { requireUserId } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireUserId(request);
  const data = await prisma.user.findMany();
  return { ok: true, data };
};

function DashboardPage() {
  const data = useLoaderData<typeof loader>();
  const revalidator = useRevalidator();
  return (
    <div>
      Halaman dashboard
      <br />
      <Button
        loading={revalidator.state !== "idle"}
        onClick={revalidator.revalidate}
      >
        Reload
      </Button>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

export default DashboardPage;
