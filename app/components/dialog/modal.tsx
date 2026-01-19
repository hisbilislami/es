import { FocusTrap, Modal, ScrollArea, Text } from "@mantine/core";
import { Dispatch, ReactNode, SetStateAction } from "react";

type Props = {
  children: ReactNode;
  opened: boolean;
  title: string;
  size?: string;
  hideCloseButton?: boolean;
  paddingContent?: string;
  onClose: Dispatch<SetStateAction<boolean>>;
};

const TmModal = ({
  children,
  opened,
  title,
  hideCloseButton = true,
  size = "xl",
  paddingContent = "p-4",
  onClose,
}: Props) => {
  return (
    <Modal.Root
      opened={opened}
      closeOnClickOutside={false}
      size={size}
      onClose={() => onClose(false)}
      centered
      padding={0}
      scrollAreaComponent={ScrollArea.Autosize}
    >
      <FocusTrap.InitialFocus />
      <Modal.Overlay backgroundOpacity={0.55} blur={3} />

      <Modal.Content radius="lg">
        <Modal.Header className="px-5 bg-tm-gray-300 border-b-tm-gray">
          <Modal.Title>
            <Text className="font-semibold">{title}</Text>
          </Modal.Title>
          {hideCloseButton === false ? (
            <Modal.CloseButton className="bg-tm-gray-300 text-tm-dark-500" />
          ) : null}
        </Modal.Header>
        <Modal.Body className="bg-[var(--mantine-color-gray-3)]">
          <div className={`${paddingContent} bg-white`}>{children}</div>
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );
};

export default TmModal;
