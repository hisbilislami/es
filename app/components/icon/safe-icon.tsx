import { Icon, loadIcons, iconLoaded } from "@iconify/react";
import { rem } from "@mantine/core";
import { useEffect, useState } from "react";

type SafeIconProps = {
  icon: string;
  fallback?: string;
  [key: string]: unknown;
};

export function SafeIcon({
  icon,
  fallback = "tabler:help-square-rounded",
  ...props
}: SafeIconProps) {
  const [iconToRender, setIconToRender] = useState<string | null>(null);

  useEffect(() => {
    if (iconLoaded(icon)) {
      setIconToRender(icon);
    } else {
      setIconToRender(null);
      loadIcons([icon], () => {
        if (iconLoaded(icon)) {
          setIconToRender(icon);
        } else {
          setIconToRender(fallback);
        }
      });
    }
  }, [icon, fallback]);

  if (!iconToRender) return null;

  return (
    <Icon
      icon={iconToRender}
      {...props}
      style={{ width: rem(18), height: rem(18) }}
    />
  );
}
