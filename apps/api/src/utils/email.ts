import { Eta } from "eta";
import path from "path";

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
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

class EmailService {
  private provider: EmailProvider;
  private eta: Eta;

  constructor(provider: EmailProvider) {
    this.provider = provider;
    this.eta = new Eta({ views: path.join(__dirname, "../emails") });
  }

  private async renderTemplate(
    templateName: string,
    data: any
  ): Promise<string> {
    return this.eta.renderAsync(templateName, data);
  }

  async sendWelcomeEmail({
    userEmail,
    verifyUrl,
  }: {
    userEmail: string;
    verifyUrl: string;
  }): Promise<void> {
    const html = await this.renderTemplate("emailVerification", { verifyUrl });

    await this.provider.sendEmail({
      to: userEmail,
      subject: "Welcome to our app!",
      text: `Welcome to our app! Please verify your email at: ${verifyUrl}`,
      html,
    });
  }

  async sendPaymentPastDueEmail({
    userEmail,
  }: {
    userEmail: string;
  }): Promise<void> {
    const html = await this.renderTemplate("paymentPastDue", {});

    await this.provider.sendEmail({
      to: userEmail,
      subject: "Your payment is past due",
      text: "Your payment is past due. Please update your payment information.",
      html,
    });
  }

  async sendPasswordResetEmail({
    userEmail,
    resetUrl,
  }: {
    userEmail: string;
    resetUrl: string;
  }): Promise<void> {
    const html = await this.renderTemplate("passwordReset", { resetUrl });

    await this.provider.sendEmail({
      to: userEmail,
      subject: "Reset your password",
      text: `Reset your password by clicking this link: ${resetUrl}`,
      html,
    });
  }
}

function createEmailProvider(providerName: string): EmailProvider {
  switch (providerName) {
    case "localhost":
      return new LocalhostEmailProvider();
    default:
      throw new Error(`Unsupported email provider: ${providerName}`);
  }
}

// Create and export the EmailService instance
const emailProvider = createEmailProvider(
  process.env.EMAIL_PROVIDER || "localhost"
);
export const emailService = new EmailService(emailProvider);
