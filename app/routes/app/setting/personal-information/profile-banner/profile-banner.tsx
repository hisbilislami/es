import { getFormProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Card, Group, Indicator, Avatar, Text, Image } from "@mantine/core";
import {
  Form,
  useActionData,
  useFetcher,
  useRevalidator,
} from "@remix-run/react";
import { useEffect, useMemo } from "react";

import InputFileButton from "~/components/form/input-file-button";

import { action } from "../route";

import { profilePhotoSchema } from "./constants";

type ProfileBannerProps = {
  name: string;
  role?: string | null;
  profilePhotoUrl: string | null;
};

function getInitials(name: string): string {
  if (!name) {
    return "";
  }

  const words = name.trim().split(" ");
  const initials = words
    .slice(0, 2) // Take only the first two words
    .map((word) => word.charAt(0).toUpperCase())
    .join("");

  return initials;
}

function ProfileBanner({ name, role, profilePhotoUrl }: ProfileBannerProps) {
  const lastResult = useActionData<typeof action>();
  const [form, fields] = useForm({
    lastResult,
    constraint: getZodConstraint(profilePhotoSchema),
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema: profilePhotoSchema,
      });
    },
    defaultValue: {
      photoProfileId: "",
    },
  });

  const formProps = getFormProps(form);
  const fetcher = useFetcher();
  function onSuccessUploadPhoto(data: { id: number; key: string }) {
    const formData = new FormData();
    formData.append("photoProfileId", data.id.toString());
    fetcher.submit(formData, {
      method: "POST",
      action: "/app/setting/personal-information/?tab=profile-banner",
      encType: "multipart/form-data",
    });
  }
  const { revalidate: revalidateProfile, state: revalidateState } =
    useRevalidator();
  const isLoadingUpdateProfilePhoto = useMemo(
    () => fetcher.state !== "idle" || revalidateState !== "idle",
    [fetcher.state],
  );

  useEffect(() => {
    if (fetcher.data && fetcher.data.success) {
      revalidateProfile();
    }
  }, [JSON.stringify(fetcher.data)]);

  return (
    <Card radius="lg">
      <Card.Section>
        <Image
          src="/image/profile-banner-background.png"
          height={112}
          alt="Norway"
          className="max-h-28"
        />
      </Card.Section>

      <div className="relative">
        <Form id={formProps.id}>
          <Group className="-translate-y-1/2 left-1/2 -translate-x-1/2 rounded-full shadow-lg absolute">
            <Indicator
              inline
              label={
                <InputFileButton
                  name="profilePhoto"
                  emptyLabel={false}
                  dataKeys={{
                    path: "photoProfilePath",
                    id: "photoProfileId",
                  }}
                  onSuccess={onSuccessUploadPhoto}
                  fields={fields}
                >
                  <Icon icon="tabler:edit" className="w-4 h-4 cursor-pointer" />
                </InputFileButton>
              }
              size={26}
              offset={12}
              color="tmGreen"
              position="bottom-end"
            >
              <Avatar
                alt="user photo profile"
                size="xl"
                bg="gray.3"
                src={profilePhotoUrl ?? ""}
                className="border-4 border-white"
              >
                {getInitials(name)}
              </Avatar>
            </Indicator>
          </Group>
        </Form>
      </div>

      <Group align="center" className="flex flex-col mt-12">
        <Text size="md" fw={600}>
          {name}
        </Text>

        {role ? (
          <div className="bg-[var(--mantine-color-gray-1)] text-[var(--mantine-color-dark-4)] text-sm px-5 py-1.5 flex gap-2 items-center rounded-full font-medium">
            <Icon icon="tabler:briefcase" className="h-4 w-4" />
            {role}
          </div>
        ) : null}
      </Group>
    </Card>
  );
}

export default ProfileBanner;
