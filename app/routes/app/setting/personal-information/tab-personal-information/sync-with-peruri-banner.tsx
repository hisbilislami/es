import { Icon } from "@iconify/react/dist/iconify.js";
import { Button, Image, Text } from "@mantine/core";
import { Form, useFetcher } from "@remix-run/react";

import { action } from "~/routes/api/peruri/register-user/route";

function SyncWithHisBanner() {
  const fetcher = useFetcher<typeof action>();

  async function syncWithPeruri() {
    fetcher.submit(
      {},
      {
        method: "POST",
        action: "/api/peruri/register-user",
      },
    );
  }
  return (
    <div className="flex items-center py-4 px-6 bg-tm-green-100 rounded-xl gap-6 border-green-600 border">
      <span className="w-10 h-10">
        <Image src="/image/sync-his-check.svg" />
      </span>
      <div className="flex-1">
        <Text fw={400} fz={14} c="dark.6">
          ?
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
        onClick={syncWithPeruri}
      >
        Sinkronisasi Data HIS
      </Button>
    </div>
  );
}

export default SyncWithHisBanner;
