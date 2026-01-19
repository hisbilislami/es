import { Icon } from "@iconify/react/dist/iconify.js";
import { Text } from "@mantine/core";
import { useMemo } from "react";

import { cn } from "~/utils/style";

type MessageBannerProps = {
  title: string;
  description: string;
  type?: "success" | "info" | "error" | "warning";
};

function MessageBanner(props: MessageBannerProps) {
  const { title, description, type = "info" } = props;
  const cardTheme = useMemo(() => {
    const theme = {
      background: "text-tm-blue-600 border-tm-blue-400 bg-tm-blue-100",
      icon: "alert-circle-filled",
    };

    switch (type) {
      case "success":
        theme.background =
          "text-tm-green-600 border-tm-green-400 bg-tm-green-100";
        theme.icon = "rosette-discount-check-filled";
        return theme;
      case "info":
      default:
        return theme;
    }
  }, [type]);
  return (
    <div
      className={cn(
        "flex items-center py-4 px-6 rounded-xl gap-4 border",
        cardTheme.background,
      )}
    >
      <span className="w-10 h-10 shrink-0">
        <Icon icon={`tabler:${cardTheme.icon}`} className="w-10 h-10" />
      </span>
      <div className="flex-1">
        <Text fw={600} fz={16} c="dark.6">
          {title}
        </Text>
        <Text fw={300} fz={14} c="dark.6">
          {description}
        </Text>
      </div>
    </div>
  );
}

export default MessageBanner;
