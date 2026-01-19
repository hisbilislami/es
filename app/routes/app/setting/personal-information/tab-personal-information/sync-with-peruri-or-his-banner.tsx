import { Icon } from "@iconify/react/dist/iconify.js";
import { Button, Image, Text } from "@mantine/core";
import { useFetcher, useNavigation } from "@remix-run/react";
import { useDialog } from "~/context/DialogContext";

import { action } from "~/routes/api/peruri/register-user/route";

type Props = {
  syncWithPeruriState: boolean;
  readyToSync: boolean;
};

function SyncWithPeruriOrHisBanner({
  syncWithPeruriState,
  readyToSync,
}: Props) {
  const fetcher = useFetcher<typeof action>();

  const navigation = useNavigation();

  const dialog = useDialog();

  async function syncWithPeruri() {
    fetcher.submit(
      {},
      {
        method: "POST",
        action: "/api/peruri/register-user",
      },
    );
  }

  async function syncWithHis() {
    /* fetcher.submit( */
    /*   {}, */
    /*   { */
    /*     method: "POST", */
    /*     action: "", */
    /*   }, */
    /* ); */
    dialog.showDialog({
      title: "Segera Hadir",
      type: "info",
      description: "Fitur ini dalam progress pekerjaan.",
    });
  }

  return (
    <div className="flex items-center py-4 px-6 bg-tm-green-100 rounded-xl gap-4 border-green-600 border">
      <span className="w-10 h-10">
        <Image src="/image/sync-his-check.svg" />
      </span>
      <div className="flex-1">
        <Text fw={400} fz={14} c="dark.6">
          Sudah punya data sebelumnya?
        </Text>
        <Text fw={600} fz={14}>
          Lakukan registrasi dengan Sinkronisasi Peruri atau HIS.
        </Text>
      </div>

      <Button
        rightSection={<Icon icon="tabler:refresh" />}
        color="tmBlue.6"
        size="sm"
        disabled={!(readyToSync && !syncWithPeruriState)}
        loading={navigation.state !== "idle"}
        className="font-normal"
        onClick={syncWithPeruri}
      >
        Sinkronisasi Peruri
      </Button>
      <Button
        rightSection={<Icon icon="tabler:refresh" />}
        color="tmGreen.6"
        size="sm"
        disabled
        className="font-normal"
        onClick={syncWithHis}
      >
        Sinkronisasi HIS
      </Button>
    </div>
  );
}

export default SyncWithPeruriOrHisBanner;
