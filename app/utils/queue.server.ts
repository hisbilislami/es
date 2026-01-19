import type { Processor } from "bullmq";
import { Queue as BullQueue, Worker } from "bullmq";

import redis from "./redis.server";

type RegisteredQueue = {
  queue: BullQueue;
  worker: Worker;
};

let __registeredQueues: Record<string, RegisteredQueue> | undefined;

const registeredQueues = __registeredQueues || (__registeredQueues = {});

export function Queue<Payload>(
  name: string,
  handler: Processor<Payload>,
): BullQueue {
  if (registeredQueues[name]) {
    return registeredQueues[name].queue;
  }

  const queue = new BullQueue(name, { connection: redis });

  // const worker = new Worker(name, handler, { connection: redis });
  const worker = new Worker(
    name,
    async (job) => {
      console.log(
        `[Worker] ${name}: Running job ${job.name} at ${new Date().toISOString()}`,
      );
      try {
        await handler(job);
      } catch (error) {
        console.error(`[Worker] ${name}: Job failed`, error);
      }
    },
    { connection: redis },
  );

  registeredQueues[name] = { queue, worker };

  return queue;
}
