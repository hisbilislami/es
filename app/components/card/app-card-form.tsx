import { Card, Text } from "@mantine/core";
import { ReactNode } from "react";

interface AppCardFormProps {
  children: ReactNode;
  title: string;
  isForm: boolean;
  actionButtons?: ReactNode;
  ctButtonClassName?: string;
  borderTop?: boolean;
}

function AppCardForm({
  children,
  title,
  isForm = false,
  actionButtons,
  ctButtonClassName,
  borderTop = false,
}: AppCardFormProps) {
  return (
    <div className="h-full w-full px-5 py-5">
      <div
        className={`bg-tm-gray-100 rounded-t-xl py-2 px-11 w-full ${borderTop ? "border border-t-gray-200" : null}`}
      >
        <Text className="text-black text-md" fw={600}>
          {title}
        </Text>
      </div>
      <Card
        className={`flex flex-col gap-6 w-full bg-white rounded-b-xl rounded-t-none ${!borderTop ? "border border-t-gray-200" : "border border-t-none border-l-gray-200 border-r-gray-200 border-b-gray-200"} border-white p-0`}
      >
        {isForm ? (
          <>
            {children}
            {actionButtons && (
              <FormActionButton
                actionButtons={actionButtons}
                ctButtonClassName={ctButtonClassName}
              />
            )}
          </>
        ) : (
          <div className="p-5">{children}</div>
        )}
      </Card>
    </div>
  );
}

export function FormActionButton({
  actionButtons,
  ctButtonClassName,
}: {
  actionButtons?: ReactNode;
  ctButtonClassName?: string;
}) {
  return (
    <>
      <div
        className={`bg-white rounded-b-xl py-2 px-8 w-full border-t border-t-gray-200 border-b-0 ${ctButtonClassName} flex justify-end col-span-full`}
      >
        {actionButtons}
      </div>
    </>
  );
}

export default AppCardForm;
