import { Icon } from "@iconify/react";
import { Group, Box, Collapse, ThemeIcon, UnstyledButton } from "@mantine/core";
import { Link, useLocation, useNavigate } from "@remix-run/react";
import { useState } from "react";

import { cn } from "~/utils/style";

import { SafeIcon } from "../icon/safe-icon";

import { AppPageMenu, AppSubmoduleMenu } from "./types";

type LinksGroupProps = {
  module: Omit<AppSubmoduleMenu, "pages">;
  child: AppPageMenu[];
};

export function LinksGroup({ module, child }: LinksGroupProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const hasLinks = Array.isArray(child) && child.length > 0;
  const [opened, setOpened] = useState(false);

  function isPathnameMatch(link: string) {
    if (!link) return false;
    return location.pathname === link && location.pathname.includes(link);
  }

  function onClickParentMenu() {
    module?.path && child.length === 0
      ? navigate(module.path)
      : setOpened((o) => !o);
  }
  const items = (hasLinks ? child : []).map((link, idx) => (
    <Link to={link.path} key={`menu-${link.path}-${idx}`} prefetch="none">
      <UnstyledButton
        className={cn(
          "font-normal w-full !py-2 !pl-2 !ml-8 !text-sm",
          "!text-[var(--mantine-color-black)]",
          "!border-l !border-solid !border-[var(--mantine-color-gray-3)]",
          "hover:!text-[var(--mantine-color-tmBlue-6)]",
          isPathnameMatch(link.path)
            ? "!text-[var(--mantine-color-tmBlue-6)] !bg-[var(--mantine-color-gray-3)]"
            : "hover:!bg-[var(--mantine-color-gray-2)]",
          isPathnameMatch(link.path)
            ? "!border-l !border-solid !border-[var(--mantine-color-tmBlue-6)]"
            : "",
        )}
      >
        <Box style={{ display: "flex", alignItems: "center" }}>
          {link.icon ? (
            <ThemeIcon
              variant="white"
              className="!bg-transparent"
              color={isPathnameMatch(link.path) ? "tmBlue" : "black"}
              size={30}
            >
              <SafeIcon icon={`${link.icon}`} />
            </ThemeIcon>
          ) : null}
          <Box ml="md">{link.label}</Box>
        </Box>
      </UnstyledButton>
    </Link>
  ));

  return (
    <>
      <UnstyledButton
        onClick={onClickParentMenu}
        className={cn(
          "w-full font-medium block no-underline !px-4 !py-[0.625rem] text-sm text-[var(--mantine-color-text)] rounded",
          "hover:!text-[var(--mantine-color-black)]",
          isPathnameMatch(module?.path)
            ? "!text-[var(--mantine-color-tmBlue-6)] !bg-[var(--mantine-color-gray-2)]"
            : "hover:!bg-[var(--mantine-color-gray-2)]",
        )}
      >
        <Group justify="space-between" gap={0}>
          <Box style={{ display: "flex", alignItems: "center" }}>
            <ThemeIcon variant="light" size={30}>
              <SafeIcon icon={`${module?.icon}`} />
            </ThemeIcon>
            <Box ml="md">{module?.label}</Box>
          </Box>
          {hasLinks ? (
            <Icon
              icon="tabler:chevron-right"
              className={cn(
                "transition-transform duration-200",
                "w-4 h-4",
                opened ? "rotate-90" : "rotate-0",
                "stroke-[1.5]",
              )}
            />
          ) : null}
        </Group>
      </UnstyledButton>
      {hasLinks ? (
        <Collapse in={opened} className="overflow-x-hidden">
          {items}
        </Collapse>
      ) : null}
    </>
  );
}
