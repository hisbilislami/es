import { Image, Text } from "@mantine/core";
import { Outlet } from "@remix-run/react";

import TrustmedisSignLogo from "~/components/logo/trustmedis-sign-logo";

export default function AuthenticationLayout() {
  return (
    <div className="relative overflow-x-hidden h-screen flex-col lg:items-center lg:justify-center md:grid lg:max-w-none lg:grid-cols-6 lg:px-0">
      <div className="relative lg:col-span-3 h-full flex-col flex">
        <div className="w-full h-full z-10">
          <Outlet />
        </div>
      </div>

      <div className="lg:p-4 lg:col-span-3 hidden h-screen lg:grid grid-cols-3 gap-3">
        <div className="col-span-1 flex flex-col gap-y-3">
          <div className="overflow-hidden h-[21%]">
            <Image
              src="https://images.unsplash.com/photo-1567201864585-6baec9110dac"
              className="rounded-r-[20px] rounded-tl-[20px] object-cover w-full h-full"
            />
          </div>
          <div className="overflow-hidden h-[24.5%]">
            <Image
              src="https://images.unsplash.com/photo-1557825835-70d97c4aa567"
              className="rounded-r-[20px] object-cover w-full h-full"
            />
          </div>
          <div className="h-[24.5%] bg-[var(--mantine-color-gray-0)] rounded-r-[20px] flex flex-col items-start justify-end p-5">
            <Image
              src="/image/auth-icon-pen-sign.svg"
              width={44}
              height={44}
              className="shrink-0 w-11 h-11"
            />
            <Text fz={18} fw={900} c="dark.3" className="leading-5 mt-2">
              Tanda Tangan
            </Text>
            <Text fz={14} fw={300} c="dark.2" className="leading-5 mt-1">
              Pembubuhan Tanda Tangan
            </Text>
          </div>
          <div className="overflow-hidden h-[30%]">
            <Image
              src="https://images.unsplash.com/photo-1562564055-71e051d33c19"
              className="rounded-r-[20px] rounded-bl-[20px] object-cover w-full h-full"
            />
          </div>
        </div>

        <div className="col-span-1 flex flex-col gap-y-3">
          <div className="h-[24.5%] bg-[var(--mantine-color-gray-0)] rounded-[20px] flex flex-col items-start justify-end p-5">
            <Image
              src="/image/auth-icon-connect.svg"
              width={44}
              height={44}
              className="shrink-0 w-11 h-11"
            />
            <Text fz={18} fw={900} c="dark.3" className="leading-5 mt-2">
              Integrasi HIS
            </Text>
            <Text fz={14} fw={300} c="dark.2" className="leading-5 mt-1">
              Dokumen terhubung dengan sistem HIS
            </Text>
          </div>
          <div className="h-[24.5%] rounded-[20px] flex flex-col items-start justify-end border border-[var(--mantine-color-gray-2)]">
            <div className="bg-white p-3 rounded-t-[20px] flex gap-2 w-full">
              <span className="h-3 w-3 bg-tm-blue-600 rounded-full"></span>
              <span className="h-3 w-3 bg-[var(--mantine-color-gray-3)] rounded-full"></span>
              <span className="h-3 w-3 bg-tm-green-600 rounded-full"></span>
            </div>

            <div className="bg-[var(--mantine-color-gray-0)] h-full w-full flex-col flex p-3 rounded-b-[20px] gap-2">
              <div className="bg-white w-full p-3 flex items-center shadow rounded-[20px] gap-2">
                <span className="h-6 w-6 bg-[var(--mantine-color-gray-3)] rounded-full"></span>
                <span className="flex-1 h-2 bg-[var(--mantine-color-gray-3)] rounded-full"></span>
              </div>

              <div className="bg-white w-full p-3 flex items-center shadow rounded-[20px] gap-2">
                <span className="h-6 w-6 bg-[var(--mantine-color-gray-3)] rounded-full"></span>
                <span className="flex-1 h-2 bg-[var(--mantine-color-gray-3)] rounded-full"></span>
              </div>
            </div>
          </div>
          <div className="overflow-hidden h-[30%]">
            <Image
              src="https://images.unsplash.com/photo-1589330694653-ded6df03f754"
              className="rounded-[20px] object-cover w-full h-full"
            />
          </div>
          <div className="h-[21%] rounded-[20px] flex flex-col items-start justify-end border border-[var(--mantine-color-gray-2)]">
            <div className="bg-white p-3 rounded-t-[20px] flex gap-2 w-full">
              <span className="h-3 w-3 bg-tm-blue-600 rounded-full"></span>
              <span className="h-3 w-3 bg-[var(--mantine-color-gray-3)] rounded-full"></span>
              <span className="h-3 w-3 bg-tm-green-600 rounded-full"></span>
            </div>

            <div className="bg-[var(--mantine-color-gray-0)] h-full w-full flex-col flex p-3 rounded-b-[20px] gap-2">
              <div className="bg-white w-full p-3 flex items-center shadow rounded-[20px] gap-2">
                <span className="h-6 w-6 bg-[var(--mantine-color-gray-3)] rounded-full"></span>
                <span className="flex-1 h-2 bg-[var(--mantine-color-gray-3)] rounded-full"></span>
              </div>

              <div className="bg-white w-full p-3 flex items-center shadow rounded-[20px] gap-2">
                <span className="h-6 w-6 bg-[var(--mantine-color-gray-3)] rounded-full"></span>
                <span className="flex-1 h-2 bg-[var(--mantine-color-gray-3)] rounded-full"></span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-1 flex flex-col gap-y-3">
          <div className="overflow-hidden h-[13.5%] bg-[var(--mantine-color-gray-0)] rounded-l-[20px] rounded-tr-[20px] flex items-center justify-center">
            <Image
              src="/logo/e-sign-logo-full.svg"
              className="object-cover w-40 h-10"
            />
          </div>
          <div className="overflow-hidden h-[27%]">
            <Image
              src="/image/auth-illustration-5.png"
              className="rounded-l-[20px] object-cover w-full h-full"
            />
          </div>
          <div className="h-[24.5%] bg-[var(--mantine-color-gray-0)] rounded-l-[20px] flex flex-col items-start justify-end p-5">
            <Image
              src="/image/auth-icon-shield.svg"
              width={44}
              height={44}
              className="shrink-0 w-11 h-11"
            />
            <Text fz={18} fw={900} c="dark.3" className="leading-5 mt-2">
              Keamanan
            </Text>
            <Text fz={14} fw={300} c="dark.2" className="leading-5 mt-1">
              Dokumen aman dan diakui secara hukum
            </Text>
          </div>
          <div className="overflow-hidden h-[35%]">
            <Image
              src="https://images.unsplash.com/photo-1625750998899-61a72bc58c80"
              className="rounded-l-[20px] rounded-br-[20px] object-cover w-full h-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
