import { Outlet } from "@remix-run/react";
import TrustmedisSignLogo from "~/components/logo/trustmedis-sign-logo";

export default function RegistrationLayout() {
  return (
    <div className="relative h-screen flex-col lg:items-center lg:justify-center md:grid lg:max-w-none lg:grid-cols-6 lg:px-0">
      <div className="relative lg:col-span-3 h-full flex-col flex dark:border-r">
        <div className="absolute inset-0 bg-tm-blue-600"></div>
        <img
          src="https://images.unsplash.com/photo-1483366774565-c783b9f70e2c"
          alt="Registration"
          className="absolute object-cover h-full opacity-30 mix-blend-multiply"
        />
        <div className="w-full h-full z-10">
          <Outlet />
        </div>
      </div>

      <div className="lg:p-8 lg:col-span-3 hidden h-full lg:flex bg-gradient-to-b from-white to-[#E9ECEF]">
        <div className="mx-auto flex flex-col justify-center w-[350px] lg:w-full">
          <div className="flex flex-col justify-center">
            <div className="mx-auto w-full max-w-md px-8"></div>
          </div>

          <div className="flex flex-col mx-auto text-center w-5/6 lg:w-full">
            <TrustmedisSignLogo />
          </div>
        </div>
      </div>
    </div>
  );
}
