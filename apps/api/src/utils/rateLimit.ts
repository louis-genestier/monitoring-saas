import { getConnInfo } from "@hono/node-server/conninfo";
import { rateLimiter } from "hono-rate-limiter";

export const rateLimiterInstance = (limit: number, windowMin: number) =>
  rateLimiter({
    windowMs: 60 * 1000 * windowMin, // Time window in milliseconds
    message: "Rate limit exceeded", // Message to return when rate limit is exceeded
    limit, // Number of requests allowed in the windowMs time period
    keyGenerator: (c) => {
      const conn = getConnInfo(c);
      const ip =
        c.req.header("X-Forwarded-For") ||
        c.req.header("X-Real-IP") ||
        conn.remote.address ||
        "unknown";

      console.log(ip);
      return ip;
    },
    standardHeaders: "draft-6",
  });
