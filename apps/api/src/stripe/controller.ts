import { Hono } from "hono";
import { Stripe } from "stripe";
import {
  handleCheckoutSessionCompleted,
  handleInvoicePaid,
  handleInvoicePaymentFailed,
  handleSubscriptionDeleted,
  stripe,
} from "./service";
import { AppError, BadRequestError } from "@/utils/errors";
import { STRIPE_WEBHOOK_SECRET } from "@/config/env";

const app = new Hono();

const routes = app.post("/webhook", async (c) => {
  const sig = c.req.header("stripe-signature");
  const body = await c.req.text();

  if (!sig) {
    throw new BadRequestError("No stripe signature provided");
  }

  let event: Stripe.Event;

  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      sig,
      STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    if (err instanceof Stripe.errors.StripeSignatureVerificationError) {
      console.error("Stripe signature verification failed: ", err);
      throw new BadRequestError(err.message);
    }

    console.error("get stripe event: ", err);
    throw new AppError("Failed to get stripe event", 500);
  }

  console.log("stripe event: ", event);

  switch (event.type) {
    case "checkout.session.completed":
      // Payment is successful and the subscription is created.
      // You should provision the subscription and save the customer ID to your database.
      const paymentIntent = event.data.object;
      await handleCheckoutSessionCompleted(paymentIntent);
      break;
    case "invoice.paid":
      // Continue to provision the subscription as payments continue to be made.
      // Store the status in your database and check when a user accesses your service.
      // This approach helps you avoid hitting rate limits.
      const paymentMethod = event.data.object;
      await handleInvoicePaid(paymentMethod);
      break;
    case "invoice.payment_failed":
      //   The payment failed or the customer does not have a valid payment method.
      //   The subscription becomes past_due. Notify your customer and send them to the
      //   customer portal to update their payment information.
      const subscription = event.data.object;
      await handleInvoicePaymentFailed(subscription);
      break;
    case "customer.subscription.deleted":
      const deletedSubscription = event.data.object;
      await handleSubscriptionDeleted(deletedSubscription);
      break;
    // ... handle other event types
    default:
      // Unexpected event type
      console.log(`Unhandled stripe event type ${event.type}`);
      return c.json({ status: "ok" });
  }

  return c.json({ received: true });
});

export { routes as stripeRoutes };
