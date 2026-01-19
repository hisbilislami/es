import { Icon } from "@iconify/react";
import {
  ActionIcon,
  Image,
  Title,
  Tooltip,
  UnstyledButton,
} from "@mantine/core";
import { useDisclosure, useLocalStorage } from "@mantine/hooks";
import { useFetcher, useSearchParams } from "@remix-run/react";
import { useEffect, useMemo } from "react";

import { cn } from "~/utils/style";

import { SafeIcon } from "../icon/safe-icon";

import { LinksGroup } from "./links-group";
import type { AppModuleMenu } from "./types";

export function Sidebar() {
  const fetcher = useFetcher<AppModuleMenu[]>();
  const [searchParams] = useSearchParams();
  const [isMenuMinimize, minimizeMenuHandlers] = useDisclosure();

  const [activeModule, setActiveModule] = useLocalStorage<AppModuleMenu | null>(
    {
      key: "active-module",
      defaultValue: null,
    },
  );

  // Load sidebar menu from API on first render
  useEffect(() => {
    if (fetcher.state === "idle" && !fetcher.data) {
      fetcher.load("/api/sidebar-menu");
    }
  }, [fetcher]);

  // Reactively update local active module once menu loads
  useEffect(() => {
    if (!activeModule && fetcher.data?.length) {
      setActiveModule(fetcher.data[0]);
      return;
    }

    // Keep it synced with latest data
    const updatedModule = fetcher.data?.find(
      (mod) => mod.label === activeModule?.label,
    );

    if (!updatedModule && fetcher.data?.length) {
      // fallback to first
      setActiveModule(fetcher.data[0]);
    } else if (
      updatedModule &&
      JSON.stringify(updatedModule) !== JSON.stringify(activeModule)
    ) {
      // Update if data changed (e.g., label was edited in DB)
      setActiveModule(updatedModule);
    }
  }, [fetcher.data, activeModule, setActiveModule]);

  // Sidebar visibility based on ?sidebar param
  const sidebarVisible = useMemo(() => {
    return searchParams.get("sidebar") !== "false";
  }, [searchParams]);

  const appModules = useMemo(() => {
    return (fetcher.data ?? []).map((module) => (
      <Tooltip
        key={module.label}
        label={module.label}
        position="right"
        withArrow
        transitionProps={{ duration: 0 }}
      >
        <UnstyledButton
          onClick={() => setActiveModule(module)}
          className={cn(
            "rounded-lg flex items-center justify-center p-[10px]",
            "text-[var(--mantine-color-gray-7)] hover:bg-[var(--mantine-color-gray-0)]",
            module.label === activeModule?.label
              ? "bg-tm-blue-100 text-tm-blue-600 hover:bg-tm-blue-100"
              : "",
          )}
        >
          {/* <Icon icon={`${module.icon}`} className="h-6 w-6 stroke-[1.5]" /> */}
          <SafeIcon icon={`${module.icon}`} className="h-6 w-6 stroke-[1.5]" />
        </UnstyledButton>
      </Tooltip>
    ));
  }, [fetcher.data, activeModule, setActiveModule]);

  if (!sidebarVisible) return null;

  return (
    <nav
      className={cn(
        "w-full flex h-full",
        "border-r border-[var(--mantine-color-gray-3)]",
        isMenuMinimize ? "max-w-[68px]" : "max-w-80",
      )}
    >
      {/* Left panel */}
      <div
        className={cn(
          "w-[68px] flex flex-col gap-2 items-center justify-between",
          "bg-[var(--mantine-color-body)] z-[5]",
          "border-r border-[var(--mantine-color-gray-3)]",
        )}
      >
        <div className="flex flex-col flex-1">
          <div
            className={cn(
              "w-full flex justify-center h-[68px] p-[12px]",
              "border-b border-[var(--mantine-color-gray-3)]",
            )}
          >
            <Image src="/logo/e-sign-logo.svg" w={44} h={44} />
          </div>
          <div className="gap-2 flex flex-col px-3 py-4">{appModules}</div>
        </div>

        <div className="px-3 py-4 flex w-full">
          <ActionIcon
            variant="subtle"
            size="xl"
            color="tmBlue.5"
            className="rounded-lg"
            onClick={() =>
              isMenuMinimize
                ? minimizeMenuHandlers.close()
                : minimizeMenuHandlers.open()
            }
          >
            <Icon
              icon="tabler:chevrons-right"
              className={cn(
                "h-6 w-6 text-tm-blue-600",
                "transition-transform duration-300",
                isMenuMinimize ? "-rotate-180" : "rotate-0",
              )}
            />
          </ActionIcon>
        </div>
      </div>

      {/* Right panel */}
      <div
        className={cn(
          "flex-1 bg-[#F1F3F5] flex flex-col transition-transform duration-300 overflow-hidden",
          isMenuMinimize
            ? "-translate-x-full"
            : "w-[calc(256px - 68px)] translate-x-0",
        )}
      >
        <Title
          order={4}
          className={cn(
            "bg-[var(--mantine-color-body)] min-h-[68px] px-3 flex items-center",
            "border-b border-[var(--mantine-color-gray-3)]",
          )}
        >
          {activeModule?.label}
        </Title>

        <div className="gap-2 flex flex-col px-3 py-4 overflow-y-auto">
          {activeModule?.submodules?.length ? (
            activeModule.submodules.map((submodule, idx) => {
              const { pages, ...module } = submodule;
              return (
                <LinksGroup
                  key={`menu-${submodule.label}-${idx}`}
                  module={module}
                  child={pages}
                />
              );
            })
          ) : (
            <div className="text-sm text-gray-500 italic">
              No menus available.
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
