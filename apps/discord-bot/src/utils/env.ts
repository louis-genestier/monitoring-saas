import { config } from "dotenv";
import { object, parse, pipe, string, url } from "valibot";

config();

const envSchema = object({
  DISCORD_CHANNEL_ID: string(),
  DISCORD_BOT_TOKEN: string(),
  CLIENT_ID: string(),
  GUILD_ID: string(),
  MOBILE_PROXY_URL: pipe(string(), url()),
  RESIDENTIAL_PROXY_URL: pipe(string(), url()),
});

const env = parse(envSchema, process.env);

export const {
  DISCORD_CHANNEL_ID,
  DISCORD_BOT_TOKEN,
  CLIENT_ID,
  GUILD_ID,
  MOBILE_PROXY_URL,
  RESIDENTIAL_PROXY_URL,
} = env;
