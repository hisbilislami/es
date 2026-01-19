import { z } from "zod";

export const clientFormLabel = {
  client_id: {
    name: "client_id",
    label: "Client ID",
    placeholder: "Client ID",
    withAsterisk: true,
  },
  api_key: {
    name: "api_key",
    label: "API Key",
    placeholder: "[Auto Generate]",
    withAsterisk: false,
  },
  api_url: {
    name: "api_url",
    label: "API Base URL",
    placeholder: "[Auto Generate]",
    withAsterisk: true,
  },
  active: {
    name: "active",
    label: "Status",
    placeholder: "Status",
    withAsterisk: true,
  },
};

export const schema = z.object({
  id: z.number().optional(),
  client_id: z.string({ required_error: "Client ID harus diisi" }),
  api_key: z.string().optional(),
  api_url: z.string({ required_error: "API URL akan otomatis terisi" }),
  active: z.string({ required_error: "Input tidak valid" }),
});
