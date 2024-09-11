import { Hono } from "hono";
import { Stripe } from "stripe";
import {
  handleCheckoutSessionCompleted,
  handleInvoicePaid,
  handleInvoicePaymentFailed,
  handleSubscriptionDeleted,
  stripe,
} from "./service";
import { AppError, BadRequestError, NotFoundError } from "@/utils/errors";
import { FRONTEND_URL, STRIPE_WEBHOOK_SECRET } from "@/config/env";
import { object, string } from "valibot";
import { vValidator } from "@hono/valibot-validator";
import { sessionMiddleware } from "@/auth/middleware/sessionMiddleware";
import { Context } from "@/types/honoContext";
import { prisma } from "@/config/prisma";

const createSessionSchema = object({
  priceId: string(),
});

const app = new Hono<Context>();

const routes = app
  .post("/webhook", async (c) => {
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

    try {
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
    } catch (err: any) {
      console.error(`handle stripe event ${event.type}: `, err);
      throw new AppError("Failed to handle stripe event", 500);
    }
  })
  .post(
    "/create-checkout-session",
    sessionMiddleware,
    vValidator("json", createSessionSchema),
    async (c) => {
      const { priceId } = c.req.valid("json");
      const user = c.get("user");

      if (!user) {
        throw new AppError("User not found", 404);
      }

      const { stripeId } = await prisma.user.findUniqueOrThrow({
        where: {
          id: user.id,
        },
        select: {
          stripeId: true,
        },
      });

      if (!stripeId) {
        throw new AppError("User stripe id not found", 404);
      }

      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: "subscription",
        customer: stripeId,
        cancel_url: `${FRONTEND_URL}/parametres`,
        success_url: `${FRONTEND_URL}/parametres?session_id={CHECKOUT_SESSION_ID}`,
      });

      if (!session.url) {
        throw new AppError("Failed to create stripe session", 500);
      }

      return c.json({ url: session.url });
    }
  )
  .get("/checkout-session/:sessionId", async (c) => {
    const sessionId = c.req.param("sessionId");
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      const customer = await stripe.customers.retrieve(
        session.customer as string
      );

      return c.json({
        ...customer,
      });
    } catch (e) {
      if (e instanceof Stripe.errors.StripeError) {
        throw new NotFoundError("Stripe session not found");
      }

      throw new AppError("Failed to get session", 500);
    }
  });

export { routes as stripeRoutes };
