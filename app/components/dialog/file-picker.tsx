import {
  Box,
  Button,
  Card,
  Image,
  Modal,
  SimpleGrid,
  Text,
} from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import { useState } from "react";

type Props = {
  opened: boolean;
  onClose: () => void;
  files: { id: string; name: string; url: string }[];
  onSelect: (file: { id: string; name: string; url: string }) => void;
};

const FilePicker = ({ opened, onClose, files, onSelect }: Props) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleConfirm = () => {
    const selected = files.find((f) => f.id === selectedId);
    if (selected) {
      onSelect(selected);
      onClose();
    }
  };

  return (
    <Modal opened={opened} size="xl" onClose={onClose} title="Pilih File">
      <SimpleGrid cols={5}>
        {files.map((file) => (
          <Card
            key={file.id}
            shadow="xs"
            radius="md"
            withBorder
            onClick={() => {
              return setSelectedId(file.id);
            }}
            className={`cursor-pointer ${selectedId === file.id ? "border-tm-blue-600" : "var(--mantine-color-border)"}`}
          >
            <Box pos="relative">
              <Image src={file.url} height={120} fit="cover" radius="sm" />
              {selectedId === file.id && (
                <Box
                  pos="absolute"
                  top={4}
                  right={4}
                  bg="tmBlue"
                  p={4}
                  className="rounded-full"
                >
                  <IconCheck className="text-white" />
                </Box>
              )}
              <Text size="sm" mt="xs" truncate="end">
                {file.name}
              </Text>
            </Box>
          </Card>
        ))}
      </SimpleGrid>
      <Button fullWidth mt="md" onClick={handleConfirm} disabled={!selectedId}>
        Gunakan file ini
      </Button>
    </Modal>
  );
};

export default FilePicker;
