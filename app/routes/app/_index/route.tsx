import { Icon } from "@iconify/react/dist/iconify.js";
import { Button, Card, Image, Text } from "@mantine/core";
import { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";

import { requireUserId } from "~/utils/auth.server";
import { createMetaTitle } from "~/utils/page-meta";
import { cn } from "~/utils/style";

export const meta: MetaFunction = ({ matches }) => {
  const title = createMetaTitle({ matches, title: "Dashboard" });
  return [{ title }];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireUserId(request);

  return {};
};

function DashboardPage() {
  const cardPosition = [
    {
      key: "employee-quota",
      title: "Kuota Pegawai",
    },
    {
      key: "total-employee",
      title: "Total Pegawai",
    },
    {
      key: "total-patient",
      title: "Total Pasien",
    },
    {
      key: "account-verification",
      title: "Verifikasi Akun",
    },
    {
      key: "finish-quota",
      title: "Kuota Selesai",
      cardBg: "",
    },
    {
      key: "pending-quota",
      title: "Kuota Tertunda",
      bg: "bg-orange-100",
    },
    {
      key: "rejected-quota",
      title: "Kuota Ditolak",
      bg: "bg-red-100",
    },
  ];
  return (
    <div className="p-6 grid grid-cols-12 gap-6">
      <Card className="col-span-12" radius={16}>
        <div className="flex items-center py-4 px-6 bg-gradient-to-r from-white to-tm-blue-100 rounded-lg gap-6">
          <span className="bg-tm-green-200 w-[68px] h-[68px] rounded-full p-3">
            <Image src="/image/dashboard-icon-loyalty-card.svg" />
          </span>
          <div className="flex-1">
            <Text fw={400} fz={18} c="dark.5">
              Tanda tangan digital Anda habis?
            </Text>
            <Text fw={600} fz={20}>
              Tambah Kuota Tanda Tangan untuk dokumen Anda.
            </Text>
          </div>

          <Button leftSection={<Icon icon="tabler:plus" />} size="md">
            Tambah Kuota
          </Button>
        </div>
      </Card>

      <div className="col-span-12 grid grid-cols-12 grid-rows-2 gap-6">
        {cardPosition.map((c) => {
          return c.key !== "account-verification" ? (
            <Card
              key={c.key}
              className={cn("col-span-3 row-span-1")}
              radius={16}
            >
              <div className="flex flex-row gap-6 my-auto">
                <div className="flex flex-col flex-1 text-[var(--mantine-color-dark-6)]">
                  <span className="leading-5 font-normal">{c.title}</span>
                  <span className="font-bold text-3xl">200</span>
                </div>
                <div
                  className={cn(
                    "w-[68px] h-[68px] rounded-2xl p-[14px]",
                    c.bg ? c.bg : "bg-tm-green-200",
                  )}
                >
                  <Image src={`/image/dashboard-icon-${c.key}.svg`} />
                </div>
              </div>
            </Card>
          ) : (
            <Card
              key={c.key}
              className="col-span-3 row-span-2 bg-gradient-to-b from-tm-blue-600 to-tm-blue-800 text-white"
              radius={16}
            >
              <div className="flex flex-col gap-6 items-center">
                <div
                  className={cn(
                    "w-[68px] h-[68px] rounded-full p-[14px] bg-white",
                  )}
                >
                  <Image src={`/image/dashboard-icon-${c.key}.svg`} />
                </div>

                <div className="flex flex-col flex-1 items-center text-center">
                  <span className="leading-5 font-bold">{c.title}</span>
                  <span className="text-sm font-normal">
                    Segera lakukan verifikasi akun Anda
                  </span>
                </div>

                <Button
                  leftSection={<Icon icon="tabler:scan" className="w-5 h-5" />}
                  variant="white"
                  className="font-normal"
                  fullWidth
                >
                  Verifikasi E-KYC
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default DashboardPage;
