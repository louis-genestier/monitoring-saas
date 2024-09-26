import { config } from "dotenv";
import { object, parse, string, optional } from "valibot";

config();

const envSchema = object({
  PROXY_URL_RESIDENTIALS: optional(string()),
  PROXY_URL_DATACENTERS: optional(string()),
  RESEND_API_KEY: string(),
  PROXY_PASSWORD: string(),
});

const env = parse(envSchema, process.env);

export const {
  PROXY_URL_RESIDENTIALS,
  RESEND_API_KEY,
  PROXY_PASSWORD,
  PROXY_URL_DATACENTERS,
} = env;
