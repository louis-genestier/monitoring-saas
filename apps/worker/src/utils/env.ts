import { config } from "dotenv";
import { object, parse, string, optional } from "valibot";

config();

const envSchema = object({
  PROXY_URL: optional(string()),
});

const env = parse(envSchema, process.env);

export const { PROXY_URL } = env;
