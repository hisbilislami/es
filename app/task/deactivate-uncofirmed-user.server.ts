import * as Sentry from "@sentry/remix";

import { prisma } from "~/utils/db.server";
import { Queue } from "~/utils/queue.server";

const handler = async () => {
  try {
    const user = await prisma.user.findMany({
      where: { email_verified: false, deleted_at: null },
    });

    for (const u of user) {
      await prisma.user.update({
        where: { id: u.id },
        data: { deleted_at: new Date() },
      });
    }
  } catch (error) {
    Sentry.captureException(error);
  }
};

export const deactivateUnconfirmedUsersQueue = Queue(
  "deactivate-unconfirmed-users",
  async () => {
    await handler();
  },
);
