import { createId as cuid } from "@paralleldrive/cuid2";
import { createCookieSessionStorage, redirect } from "@remix-run/node";
import { z } from "zod";

import { env } from "./env.server";
import { combineHeaders } from "./http";

const { SESSION_SECRET } = env();
export const dialogKey = "tmdialog";

const DialogSchema = z.object({
  id: z.string().default(() => cuid()),
  title: z.string(),
  description: z.string(),
  icon: z.string().optional(),
  type: z
    .union([
      z.literal("success"),
      z.literal("error"),
      z.literal("warning"),
      z.literal("info"),
      z.literal("confirmation"),
    ])
    .default("success"),
  confirmText: z.string().optional(),
});

export type Dialog = z.infer<typeof DialogSchema>;
export type DialogInput = z.input<typeof DialogSchema>;

export const dialogSessionStorage = createCookieSessionStorage({
  cookie: {
    name: "en_dialog",
    sameSite: "lax",
    path: "/",
    httpOnly: true,
    secrets: [SESSION_SECRET],
    secure: process.env.NODE_ENV === "production",
  },
});

export async function redirectWithDialog(
  url: string,
  dialog: DialogInput,
  init?: ResponseInit,
) {
  return redirect(url, {
    ...init,
    headers: combineHeaders(init?.headers, await createDialogHeaders(dialog)),
  });
}

export async function createDialogHeaders(dialogInput: DialogInput) {
  const session = await dialogSessionStorage.getSession();
  const dialog = DialogSchema.parse(dialogInput);
  session.flash(dialogKey, dialog);
  const cookie = await dialogSessionStorage.commitSession(session);
  return new Headers({ "set-cookie": cookie });
}

export async function getDialog(request: Request) {
  const session = await dialogSessionStorage.getSession(
    request.headers.get("cookie"),
  );
  const result = DialogSchema.safeParse(session.get(dialogKey));
  const dialog = result.success ? result.data : null;
  return {
    dialog,
    headers: dialog
      ? new Headers({
          "set-cookie": await dialogSessionStorage.destroySession(session),
        })
      : null,
  };
}
