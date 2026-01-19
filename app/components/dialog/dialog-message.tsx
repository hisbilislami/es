import { Button, Image, Modal, Stack, Text } from "@mantine/core";

import { useDialog } from "~/context/DialogContext";

const DialogMessage = () => {
  const { dialog, closeDialog } = useDialog();

  if (!dialog) return null;

  let dlg;

  switch (dialog.type) {
    case "success":
      dlg = <SuccessDialog />;
      break;
    case "error":
      dlg = <ErrorDialog />;
      break;
    case "confirmation":
      dlg = <ConfirmationDialog />;
      break;

    default:
      dlg = <SuccessDialog />;
      break;
  }

  return (
    <Modal
      opened={dialog.open}
      closeOnClickOutside={false}
      size="sm"
      onClose={closeDialog}
      withCloseButton={false}
      radius="lg"
      centered
      padding={0}
      overlayProps={{
        backgroundOpacity: 0.55,
        blur: 3,
      }}
    >
      {dlg}
    </Modal>
  );
};

/*
 * NOTE: Might consider to only create
 * one component and just switch the content
 * */

const SuccessDialog = () => {
  const { dialog, closeDialog } = useDialog();

  if (!dialog) return null;
  return (
    <div className="flex flex-col  w-full h-full relative">
      <Stack align="center" gap={0} className="p-6">
        {!dialog.icon ? (
          <Image
            src="/image/alert-success.svg"
            className="w-[84px] aspect-square"
          />
        ) : (
          <Image src={dialog.icon} className="w-[84px] aspect-square" />
        )}
        <Text className="font-semibold text-base mt-8" c="dark.6">
          {dialog.title}
        </Text>
        <Text className="text-sm" fw={400} c="#5C5F66">
          {dialog.description}
        </Text>
      </Stack>

      <div className="w-full p-6 bg-[var(--mantine-color-gray-0)]">
        <Button
          size="md"
          fullWidth
          className="font-normal"
          onClick={() => {
            if (dialog.onConfirm) {
              dialog.onConfirm();
            }
            closeDialog();
          }}
        >
          {dialog.confirmText}
        </Button>
      </div>
    </div>
  );
};

const ErrorDialog = () => {
  const { dialog, closeDialog } = useDialog();

  if (!dialog) return null;
  return (
    <div className="flex flex-col w-full h-full relative">
      <Stack align="center" className="p-6" gap={0}>
        {!dialog.icon ? (
          <Image
            src="/image/alert-danger.svg"
            className="w-[84px] aspect-square"
          />
        ) : (
          <Image src={dialog.icon} className="w-[84px] aspect-square" />
        )}
        <Text className="font-semibold text-base mt-8" c="dark.6">
          {dialog.title}
        </Text>
        <Text className="text-sm" fw={400} c="#5C5F66">
          {dialog.description}
        </Text>
      </Stack>

      <div className="w-full p-6 bg-[var(--mantine-color-gray-0)]">
        <Button
          size="md"
          fullWidth
          color="red.6"
          className="font-normal"
          onClick={() => {
            if (dialog.onConfirm) {
              dialog.onConfirm();
            }
            closeDialog();
          }}
        >
          {dialog.confirmText}
        </Button>
      </div>
    </div>
  );
};

const ConfirmationDialog = () => {
  const { dialog, closeDialog } = useDialog();

  if (!dialog) return null;
  return (
    <div className="flex flex-col w-full h-full relative">
      <Stack align="center" className="p-6" gap={0}>
        {!dialog.icon ? (
          <Image
            src="/image/alert-danger.svg"
            className="w-[84px] aspect-square"
          />
        ) : (
          <Image src={dialog.icon} className="w-[84px] aspect-square" />
        )}
        <Text className="font-semibold text-base mt-8" c="dark.6">
          {dialog.title}
        </Text>
        <Text className="text-sm" fw={400} c="#5C5F66">
          {dialog.description}
        </Text>
      </Stack>

      <div className="w-full p-6 bg-[var(--mantine-color-gray-0)]">
        <div className="flex gap-1 justify-center items-center">
          <Button
            size="md"
            variant="outline"
            fullWidth
            color="red.6"
            className="font-normal"
            onClick={() => {
              closeDialog();
            }}
          >
            Batal
          </Button>
          <Button
            size="md"
            fullWidth
            color="red.6"
            className="font-normal"
            onClick={() => {
              if (dialog.onConfirm) {
                dialog.onConfirm();
              }
              closeDialog();
            }}
          >
            {dialog.confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DialogMessage;
