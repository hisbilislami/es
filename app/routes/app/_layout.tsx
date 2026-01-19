import { data, LoaderFunctionArgs } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";

import GeneralErrorBoundary from "~/components/error-boundary/general-error-boundary";
import { Sidebar } from "~/components/layout/sidebar";
import { Topbar } from "~/components/layout/topbar";
import { requireUserId } from "~/utils/auth.server";
import { getUserSession, USER_CRED } from "~/utils/session.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireUserId(request);

  const session = await getUserSession(request);
  return data({
    ok: true,
    data: { ...session.get(USER_CRED) } as Record<"email" | "username", string>,
  });
};

export default function AuthenticationLayout() {
  const { data } = useLoaderData<typeof loader>();
  return (
    <div className="flex flex-col h-screen bg-[var(--mantine-color-gray-3)]">
      <Topbar username={data.username} email={data.email} />
      <div className="h-full max-h-full flex overflow-hidden">
        <Sidebar />
        <div className="w-full overflow-y-scroll overflow-x-hidden transition-[transform,width] duration-300">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export function ErrorBoundary() {
  return <GeneralErrorBoundary />;
}
