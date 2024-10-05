import { config } from "dotenv";
import { object, parse, string } from "valibot";

config();

const envSchema = object({
  DISCORD_CHANNEL_ID: string(),
  DISCORD_BOT_TOKEN: string(),
  CLIENT_ID: string(),
  GUILD_ID: string(),
});

const env = parse(envSchema, process.env);

export const { DISCORD_CHANNEL_ID, DISCORD_BOT_TOKEN, CLIENT_ID, GUILD_ID } =
  env;
