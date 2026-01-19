import { deactivateUnconfirmedUsersQueue } from "./deactivate-uncofirmed-user.server";

export async function scheduleJob() {
  await deactivateUnconfirmedUsersQueue.upsertJobScheduler(
    "deactivate-unconfirmed-users-job",
    {
      pattern: "0 0 * * *", // Every day at 00:00
      // pattern: "*/2 18 * * *", // Every 5 minutes during 16:00–16:59, starting on the minute. This is for testing purpose only
      tz: "Asia/Jakarta",
    },
    {
      name: "deactivate-unconfirmed-users-job",
      data: {}, // your payload
      opts: {}, // any BullMQ options like priority/delay/etc.
    },
  );
}
