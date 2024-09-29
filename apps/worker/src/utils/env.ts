import { config } from "dotenv";
import { object, parse, string, optional } from "valibot";

config();

const envSchema = object({
  PROXY_URL_RESIDENTIALS: optional(string()),
  PROXY_URL_DATACENTERS: optional(string()),
  PROXY_PASSWORD: string(),
  DISCORD_CHANNEL_ID: string(),
  DISCORD_BOT_TOKEN: string(),
});

const env = parse(envSchema, process.env);

export const {
  PROXY_URL_RESIDENTIALS,
  PROXY_PASSWORD,
  DISCORD_CHANNEL_ID,
  PROXY_URL_DATACENTERS,
  DISCORD_BOT_TOKEN,
} = env;
