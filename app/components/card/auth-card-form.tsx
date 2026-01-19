import { Card, Text } from "@mantine/core";
import { ReactNode } from "react";

import TrustmedisSignLogo from "../logo/trustmedis-sign-logo";

function AuthCardForm({
  children,
  title,
  description,
}: {
  children: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <>
      <Card className="flex flex-col gap-6 w-full lg:w-4/6 bg-white py-11 px-8">
        <div className="w-full flex flex-col gap-4">
          <TrustmedisSignLogo />
          <div className="flex flex-col gap-1">
            <Text className="text-2xl" c="dark.6" fw={800}>
              {title}
            </Text>
            <Text className="text-base leading-[18px]" c="dark.3" fw={300}>
              {description}
            </Text>
          </div>
        </div>
        {children}
      </Card>
    </>
  );
}

export default AuthCardForm;
