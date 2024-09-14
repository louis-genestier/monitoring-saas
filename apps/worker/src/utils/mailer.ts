import { Resend } from "resend";
import { RESEND_API_KEY } from "./env";

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  const resend = new Resend(RESEND_API_KEY);

  await resend.emails.send({
    from: "Louis de DealZap <louis@dealzap.fr>",
    to: options.to,
    subject: options.subject,
    text: options.text,
  });
};
