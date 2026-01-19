import { Icon } from "@iconify/react/dist/iconify.js";
import { Button, Text } from "@mantine/core";
import { LoaderFunctionArgs } from "@remix-run/node";
import { Form, useFetcher, useLoaderData, useNavigate } from "@remix-run/react";
import { IconCertificate } from "@tabler/icons-react";
import { useEffect, useState } from "react";

import AppCardForm from "~/components/card/app-card-form";
import { action } from "~/routes/api/peruri/check-certificate/route";

import { loaderHandler } from "./loader";

export const loader = ({ request }: LoaderFunctionArgs) => {
  return loaderHandler(request);
};

const CheckCertificatePage = () => {
  const data = useLoaderData<typeof loader>();

  const certificate = data.data;

  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (certificate) {
      setStatus(certificate.status);
    }
  }, [certificate]);

  const fetcher = useFetcher<typeof action>();

  const checkCertificate = async () => {
    const formData = new FormData();
    fetcher.submit(formData, {
      method: "POST",
      action: "/api/peruri/check-certificate",
    });
  };
  const navigate = useNavigate();

  return (
    <>
      <Form method="POST">
        <AppCardForm
          isForm={true}
          title="Sertifikat Digital"
          actionButtons={
            status !== "valid" ? (
              <div className="flex justify-center gap-2 w-full">
                <Button
                  type="button"
                  size="xs"
                  leftSection={
                    <Icon icon="tabler:certificate-2" className="h-5 w-5" />
                  }
                  onClick={checkCertificate}
                  loading={fetcher.state !== "idle"}
                >
                  Periksa Sertifikat
                </Button>
                {status === "expired" && (
                  <Button
                    type="button"
                    size="xs"
                    variant="outline"
                    leftSection={
                      <Icon icon="tabler:refresh" className="h-5 w-5" />
                    }
                    onClick={() =>
                      navigate("/app/security-legal/kyc?action=renewal")
                    }
                  >
                    Perpanjang Sertifikat
                  </Button>
                )}
              </div>
            ) : null
          }
        >
          <div className="flex py-5 mt-[20px] justify-center items-center">
            <div className="flex gap-2 flex-col items-center justify-center w-[60%]">
              <div className="bg-gradient-to-r from-tm-green-600 to-[#3BC9db] rounded-full p-2 border-[10px] border-tm-green-200">
                <IconCertificate className="w-10 h-10 text-white"></IconCertificate>
              </div>
              <h1 className="text-2xl font-bold">Status Sertifikat Digital</h1>
              <p className="font-light text-sm text-center">
                Check status sertifikat digital. Jika telah kadaluarsa, anda
                dapat memperbarui dengan verifikasi E-KYC ulang.
              </p>
              {status === null && (
                <Text className="mt-5 bg-tm-red-100 inline-flex gap-2 items-center p-2 rounded-md text-md font-bold text-tm-red-700">
                  <Icon
                    icon="tabler:hourglass-high"
                    className="text-xl font-extrabold"
                  />
                  Menunggu verifikasi akun
                </Text>
              )}
              {status === "valid" && (
                <Text className="mt-5 bg-tm-green-100 inline-flex gap-2 items-center p-2 rounded-md text-md font-bold text-tm-green-700">
                  <Icon
                    icon="tabler:check"
                    className="text-xl font-extrabold"
                  />
                  Masih Berlaku
                </Text>
              )}
              {status === "almost_expired" && (
                <Text className="mt-5 bg-yellow-100 inline-flex gap-2 items-center p-2 rounded-md text-md font-bold text-yellow-700">
                  <Icon
                    icon="tabler:alert-triangle"
                    className="text-xl font-extrabold"
                  />
                  Hampir Kadaluarsa
                </Text>
              )}
              {status === "expired" && (
                <Text className="mt-5 bg-tm-red-100 inline-flex gap-2 items-center p-2 rounded-md text-md font-bold text-tm-red-700">
                  <Icon icon="tabler:x" className="text-xl font-extrabold" />
                  Kadaluarsa
                </Text>
              )}
            </div>
          </div>
        </AppCardForm>
      </Form>
    </>
  );
};

export default CheckCertificatePage;
