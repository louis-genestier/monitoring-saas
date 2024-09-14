import { config } from "dotenv";
import { object, parse, string, optional } from "valibot";

config();

const envSchema = object({
  PROXY_URL: optional(string()),
  RESEND_API_KEY: string(),
});

const env = parse(envSchema, process.env);

export const { PROXY_URL, RESEND_API_KEY } = env;
