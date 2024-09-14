import { AppType } from "api";
import { hc } from "hono/client";

export const client = hc<AppType>(
  process.env.NODE_ENV !== "production" ? "/api" : process.env.API_URL || ""
);
