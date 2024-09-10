import path from "path";
import { Resend } from "resend";
import { RESEND_API_KEY, SENDER_EMAIL } from "../config/env";

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
}

interface EmailProvider {
  sendEmail(options: EmailOptions): Promise<void>;
}

class LocalhostEmailProvider implements EmailProvider {
  async sendEmail(options: EmailOptions): Promise<void> {
    console.log("Sending email", {
      ...options,
    });
  }
}

class ResendEmailProvider implements EmailProvider {
  private resend: Resend;

  constructor(apiKey: string) {
    this.resend = new Resend(apiKey);
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    await this.resend.emails.send({
      from: SENDER_EMAIL,
      subject: options.subject,
      to: options.to,
      text: options.text,
    });
  }
}

class EmailService {
  private provider: EmailProvider;

  constructor(provider: EmailProvider) {
    this.provider = provider;
  }

  async sendWelcomeEmail({
    userEmail,
    verifyUrl,
  }: {
    userEmail: string;
    verifyUrl: string;
  }): Promise<void> {
    await this.provider.sendEmail({
      to: userEmail,
      subject: "Bienvenue sur DealZap",
      text: `Salut 👋🏻,
Bienvenue sur DealZap ! Pour commencer à utiliser le site, merci de vérifier ton adresse email en cliquant sur le lien suivant: ${verifyUrl}
À bientôt`,
    });
  }

  async sendPaymentPastDueEmail({
    userEmail,
  }: {
    userEmail: string;
  }): Promise<void> {
    await this.provider.sendEmail({
      to: userEmail,
      subject: "Your payment is past due",
      text: "Your payment is past due. Please update your payment information.",
    });
  }

  async sendPasswordResetEmail({
    userEmail,
    resetUrl,
  }: {
    userEmail: string;
    resetUrl: string;
  }): Promise<void> {
    await this.provider.sendEmail({
      to: userEmail,
      subject: "Réinitialisation de ton mot de passe",
      text: `Réinitialise ton mot de passe en cliquant sur ce lien: ${resetUrl}`,
    });
  }
}

function createEmailProvider(providerName: string): EmailProvider {
  switch (providerName) {
    case "localhost":
      return new LocalhostEmailProvider();
    case "resend":
      if (!RESEND_API_KEY) {
        throw new Error("Missing API key for Resend email provider");
      }
      return new ResendEmailProvider(RESEND_API_KEY);
    default:
      throw new Error(`Unsupported email provider: ${providerName}`);
  }
}

// Create and export the EmailService instance
const emailProvider = createEmailProvider(
  process.env.EMAIL_PROVIDER || "localhost"
);
export const emailService = new EmailService(emailProvider);
