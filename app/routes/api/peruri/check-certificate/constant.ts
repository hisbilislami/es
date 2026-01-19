import { BasePeruriApiResponse } from "~/utils/peruri/types";

export type PeruriCertificateDataType = {
  email: string;
  phone: string;
  isExpired: string;
};

export type PeruriCertificateResponse =
  BasePeruriApiResponse<PeruriCertificateDataType>;
