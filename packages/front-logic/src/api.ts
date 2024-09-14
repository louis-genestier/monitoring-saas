import type { AppType } from "api";
import { hc } from "hono/client";

export const client = hc<AppType>("https://api.dealzap.fr", {
  init: {
    credentials: "include",
  },
});
