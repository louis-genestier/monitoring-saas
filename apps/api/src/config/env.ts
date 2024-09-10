import { config } from "dotenv";
import {
  object,
  number,
  string,
  pipe,
  url,
  enum as vEnum,
  parse,
  optional,
} from "valibot";

config();

enum nodeEnvs {
  development = "development",
  production = "production",
}

enum emailProviders {
  localhost = "localhost",
  resend = "resend",
}

const envSchema = object({
  PORT: number(),
  DATABASE_URL: pipe(string(), url()),
  NODE_ENV: vEnum(nodeEnvs),
  STRIPE_KEY: string(),
  STRIPE_WEBHOOK_SECRET: string(),
  STRIPE_BASIC_PRICE_ID: string(),
  STRIPE_STANDARD_PRICE_ID: string(),
  STRIPE_PREMIUM_PRICE_ID: string(),
  ADMIN_EMAILS: optional(string()),
  RESEND_API_KEY: optional(string()),
  SENDER_EMAIL: string(),
  EMAIL_PROVIDER: vEnum(emailProviders),
  FRONTEND_URL: pipe(string(), url()),
});

const env = parse(envSchema, {
  ...process.env,
  PORT: parseInt(process.env.PORT || "3000"),
});

export const {
  PORT,
  NODE_ENV,
  STRIPE_KEY,
  STRIPE_WEBHOOK_SECRET,
  STRIPE_BASIC_PRICE_ID,
  STRIPE_STANDARD_PRICE_ID,
  STRIPE_PREMIUM_PRICE_ID,
  ADMIN_EMAILS,
  RESEND_API_KEY,
  SENDER_EMAIL,
  EMAIL_PROVIDER,
  FRONTEND_URL,
} = env;
