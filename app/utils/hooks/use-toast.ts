// import { Icon } from "@iconify/react/dist/iconify.js";
import { notifications as toast } from "@mantine/notifications";
import { useEffect } from "react";

import { type Toast } from "~/utils/toast.server";

type ShowToastParams = Omit<Toast, "autoClose" | "id">;

function getColor(type: Toast["type"]) {
  switch (type) {
    case "success":
      return "tmGreen";
    case "error":
      return "red";
    case "warning":
      return "yellow";
    default:
      return "tmBlue";
  }
}

function getIcon(type: Toast["type"]) {
  switch (type) {
    case "success":
      return {
        icon: "tabler:check",
        className: "w-4 h-4",
      };
    case "error":
      return {
        icon: "tabler:x",
        className: "w-4 h-4",
      };
    case "warning":
      return {
        icon: "tabler:alert-triangle",
        className: "w-4 h-4",
      };
    default:
      return {
        icon: "tabler:info-circle",
        className: "w-4 h-4",
      };
  }
}

/**
 * @description hooks to manage toast or notification
 * @param toastData - leave as null if you just want to use the trigger function
 * @returns toasts object that consists function to toast manually base on type
 */
export function useToast(toastData?: Toast | null) {
  useEffect(() => {
    if (toastData) {
      setTimeout(() => {
        toast.show({
          title: toastData.title,
          message: toastData.description,
          color: getColor(toastData.type),
          autoClose: toastData.autoClose,
          // icon: <Icon {...getIcon(toastData.type)} />,
        });
      }, 0);
    }
  }, [toastData]);
  function showToast(data: ShowToastParams | null, autoClose = 3000) {
    if (data) {
      toast.show({
        title: data.title,
        message: data.description,
        color: getColor(data.type),
        autoClose: autoClose,
        // icon: <Icon {...getIcon(data.type)} />,
      });
    }
  }

  const toasts = {
    error: (
      { title, description }: Omit<ShowToastParams, "type">,
      autoClose = 3000
    ) => showToast({ type: "error", title, description }, autoClose),
    success: (
      { title, description }: Omit<ShowToastParams, "type">,
      autoClose = 3000
    ) => showToast({ type: "success", title, description }, autoClose),
    warning: (
      { title, description }: Omit<ShowToastParams, "type">,
      autoClose = 3000
    ) => showToast({ type: "warning", title, description }, autoClose),
    message: (
      { title, description }: Omit<ShowToastParams, "type">,
      autoClose = 3000
    ) => showToast({ type: "message", title, description }, autoClose),
  };
  return { toasts };
}
