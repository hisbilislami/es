import { Tabs } from "@mantine/core";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import {
  Link,
  ShouldRevalidateFunctionArgs,
  useLoaderData,
  useSearchParams,
} from "@remix-run/react";
import { useMemo } from "react";

import { createMetaTitle } from "~/utils/page-meta";

import { actionHandler } from "./action";
import { loaderHandler } from "./loader";
import ProfileBanner from "./profile-banner/profile-banner";
import TabHandSignature from "./tab-hand-signature/route";
import TabPersonalInformation from "./tab-personal-information/route";

export const meta: MetaFunction = ({ matches }) => {
  const title = createMetaTitle({ matches, title: "Dashboard" });
  return [{ title }];
};

export async function action(args: ActionFunctionArgs) {
  return actionHandler(args);
}

export const loader = async (args: LoaderFunctionArgs) => {
  return loaderHandler(args);
};

function DashboardPage() {
  const loaderData = useLoaderData<typeof loader>();
  const profile = loaderData.data;
  const tabs = [
    { label: "Informasi Pribadi", value: "personal-information" },
    { label: "Tanda Tangan", value: "hand-signature" },
  ];

  const [searchParams] = useSearchParams();
  const activeTab = useMemo(
    () => searchParams.get("tab") ?? "personal-information",
    [searchParams],
  );

  const tabContent = () => {
    switch (activeTab) {
      case "hand-signature":
        return <TabHandSignature />;
      case "personal-information":
      default:
        return <TabPersonalInformation />;
    }
  };

  return (
    <div className="p-6 flex flex-col gap-4">
      <ProfileBanner
        name={profile?.name ?? ""}
        role={profile?.occupation}
        profilePhotoUrl={profile?.profile_photo_url ?? ""}
      />

      <Tabs
        defaultValue={activeTab}
        className="bg-white rounded-2xl px-6 pt-2 font-light"
      >
        <Tabs.List>
          {tabs.map((t) => (
            <Link to={`?tab=${t.value}`} key={t.value}>
              <Tabs.Tab key={t.value} value={t.value}>
                {t.label}
              </Tabs.Tab>
            </Link>
          ))}
        </Tabs.List>
      </Tabs>

      {tabContent()}
    </div>
  );
}

export default DashboardPage;

export function shouldRevalidate({
  actionResult,
  defaultShouldRevalidate,
}: ShouldRevalidateFunctionArgs) {
  if (actionResult?.success) {
    return false;
  }
  return defaultShouldRevalidate;
}
