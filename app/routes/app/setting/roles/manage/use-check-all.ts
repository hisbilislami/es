import { useEffect } from "react";

export function useCheckAll(form: any, data: any) {
  function findChanges(prev: string[], curr: string[]) {
    const addedValues = curr.filter((value) => !prev.includes(value));
    const removedValues = prev.filter((value) => !curr.includes(value));

    return {
      action: addedValues.length > 0 ? "add" : "remove",
      change: addedValues.length > 0 ? addedValues[0] : removedValues[0],
    };
  }

  function changeAccess(key: string, action: string) {
    form.setFieldValue(
      "permissions",
      form.values.permissions.map((p: any) => ({
        ...p,
        [key]: action === "add" ? true : false,
      })),
    );
  }

  function mutatePermissionOptions(
    changes: { change: string; action: string },
    options: string[],
  ) {
    if (changes.change === "all") {
      if (changes.action === "add") {
        form.setFieldValue("privilege_options", [
          "all_privilege",
          "all_create",
          "all_read",
          "all_update",
          "all_delete",
        ]);
      } else {
        form.setFieldValue("privilege_options", []);
      }
      return;
    }

    if (options.includes("all_privilege")) {
      if (changes.action === "remove") {
        form.setFieldValue(
          "privilege_options",
          options.filter((o) => o !== "all_privilege"),
        );
      }
    } else {
      if (changes.action === "add" && options.length === 4) {
        form.setFieldValue("privilege_options", [...options, "all_privilege"]);
      } else {
        form.setFieldValue("privilege_options", options);
      }
    }
  }

  useEffect(() => {
    if (data) {
      const checkedOptions: [] = [];
      // const permissions = data?.roleOne?.permises ?? [];
      //
      // if (permissions.every((p) => p.canCreate))
      //   checkedOptions.push("all-create");
      // if (permissions.every((p) => p.canRead)) checkedOptions.push("all-read");
      // if (permissions.every((p) => p.canUpdate))
      //   checkedOptions.push("all-update");
      // if (permissions.every((p) => p.canDelete))
      //   checkedOptions.push("all-delete");
      //
      // if (checkedOptions.length === 4) checkedOptions.push("all");

      form.setFieldValue("privilege_options", checkedOptions);
    }
  }, []);

  const onChangePermissionsOptions = (options: string[]) => {
    const changes = findChanges(form.values.privilege_options, options);

    mutatePermissionOptions(changes, options);
    switch (changes.change) {
      case "all_create":
        changeAccess("create", changes.action);
        break;
      case "all_read":
        changeAccess("read", changes.action);
        break;
      case "all_update":
        changeAccess("update", changes.action);
        break;
      case "all_delete":
        changeAccess("delete", changes.action);
        break;
      case "all_privilege":
        form.setFieldValue(
          "permissions",
          form.values.permissions.map((p: any) => ({
            ...p,
            create: changes.action === "add" ? true : false,
            read: changes.action === "add" ? true : false,
            update: changes.action === "add" ? true : false,
            delete: changes.action === "add" ? true : false,
          })),
        );
        break;
      default:
        break;
    }
  };

  return {
    onChangePermissionsOptions,
  };
}
