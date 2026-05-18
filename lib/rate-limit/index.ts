import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = process.env.UPSTASH_REDIS_REST_URL
  ? new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN! })
  : null;

export const ipLimiter = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(60, "60 s"), analytics: false, prefix: "rl_ip" })
  : null;

export const keyLimiter = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(600, "60 s"), analytics: false, prefix: "rl_key" })
  : null;
