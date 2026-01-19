import { Icon } from "@iconify/react/dist/iconify.js";
import { Button, Image, Text } from "@mantine/core";

function SyncWithHisBanner() {
  return (
    <div className="flex items-center py-4 px-6 bg-tm-green-100 rounded-xl gap-6 border-green-600 border">
      <span className="w-10 h-10">
        <Image src="/image/sync-his-check.svg" />
      </span>
      <div className="flex-1">
        <Text fw={400} fz={14} c="dark.6">
          Sudah punya data sebelumnya?
        </Text>
        <Text fw={600} fz={16}>
          Lakukan Sinkronisasi Data HIS untuk kemudahan registrasi.
        </Text>
      </div>

      <Button
        rightSection={<Icon icon="tabler:refresh" />}
        color="green"
        size="sm"
        className="font-normal"
        disabled
      >
        Sinkronisasi Data HIS
      </Button>
    </div>
  );
}

export default SyncWithHisBanner;
