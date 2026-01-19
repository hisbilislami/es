import { remember } from "@epic-web/remember";
import Redis from "ioredis";

const redis = remember("redis", () => {
  console.log("[ioredis] Initializing Redis connection...");

  const client = new Redis(
    process.env.REDIS_URL || "redis://esign.redis:6379",
    {
      maxRetriesPerRequest: null,
    },
  );

  client.on("error", (err) => {
    console.error("[ioredis] Redis connection error:", err);
  });

  client.on("connect", () => {
    console.log("[ioredis] Connected to Redis successfully");
  });

  return client;
});

export default redis;
