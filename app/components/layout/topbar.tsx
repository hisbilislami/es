import { Icon } from "@iconify/react/dist/iconify.js";
import {
  ActionIcon,
  Avatar,
  Group,
  Image,
  UnstyledButton,
  Text,
  Menu,
} from "@mantine/core";
import { Form, Link } from "@remix-run/react";

import { cn } from "~/utils/style";

export function Topbar({
  username = "",
  email,
}: {
  username: string;
  email: string;
}) {
  return (
    <header
      className={cn(
        "shadow-lg z-10 bg-tm-blue-600 py-3 px-[44px] w-full",
        "flex justify-between items-center",
      )}
    >
      <Group className="bg-white rounded-md px-4 py-2 shadow-md">
        <Image src="/logo/e-sign-logo-full.svg" w={112} />
      </Group>

      <div className="flex gap-3">
        <ActionIcon
          variant="gradient"
          size="xl"
          className="rounded-full"
          aria-label="Gradient action icon"
          gradient={{ from: "#28B87A", to: "#3BC9DB", deg: 180 }}
        >
          <Icon icon="tabler:bell-ringing" className="h-6 w-6" />
        </ActionIcon>

        <Menu shadow="md" width={200}>
          <Menu.Target>
            <UnstyledButton className="block w-full bg-white rounded-full p-1">
              <Group>
                <Avatar
                  radius="xl"
                  size={36}
                  color="tmGreen"
                  variant="gradient"
                >
                  {username[0].toUpperCase()}
                </Avatar>

                <div className="flex-1 w-32">
                  <Text size="sm" fw={600}>
                    {username}{" "}
                  </Text>

                  <Text c="dimmed" size="xs" className="text-ellipsis">
                    {email}
                  </Text>
                </div>
              </Group>
            </UnstyledButton>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Label>{username}</Menu.Label>
            <Menu.Item
              leftSection={<Icon icon="tabler:user" className="w-4 h-4" />}
            >
              <Link to="/app/profile">Profile</Link>
            </Menu.Item>
            <Menu.Divider />
            <Form method="post" action="/auth/logout">
              <Menu.Item
                type="submit"
                color="red"
                leftSection={<Icon icon="tabler:logout" className="w-4 h-4" />}
              >
                Logout
              </Menu.Item>
            </Form>
          </Menu.Dropdown>
        </Menu>
      </div>
    </header>
  );
}
