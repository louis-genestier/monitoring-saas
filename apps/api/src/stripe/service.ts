import Stripe from "stripe";
import { STRIPE_KEY } from "../config/env";
import { prisma } from "../config/prisma";
import { paymentPlans } from "./plans";
import { emailService } from "../utils/email";
import { PaymentPlanId } from "@/types/stripe";

export const stripe = new Stripe(STRIPE_KEY, {
  apiVersion: "2024-06-20",
});

export const handleCheckoutSessionCompleted = async (
  session: Stripe.Checkout.Session
) => {
  try {
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    );
    const stripeId = session.customer as string;

    const user = await prisma.user.findUnique({
      where: { stripeId },
    });

    if (!user) {
      console.error(
        `User not found for stripe id ${stripeId}, session id ${session.id}`
      );
      return;
    }

    const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
    const priceId = lineItems.data[0]?.price?.id;

    if (!priceId) {
      console.error(`No price id found for session ${session.id}`);
      return;
    }

    const planId = Object.entries(paymentPlans).find(
      ([_, plan]) => plan.getStripePriceId() === priceId
    )?.[0] as PaymentPlanId | undefined;

    if (!planId) {
      console.error(`No plan found for price id ${priceId}`);
      return;
    }

    await prisma.subscription.create({
      data: {
        userId: user.id,
        stripeSubscriptionId: subscription.id,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        planName: planId,
        status: subscription.status,
      },
    });

    console.log(`Subscription created for user ${user.id}, plan ${planId}`);
  } catch (error) {
    console.error("Error handling checkout session completed:", error);
  }
};

export const handleInvoicePaid = async (invoice: Stripe.Invoice) => {
  try {
    if (!invoice.subscription) {
      console.log("Invoice is not associated with a subscription");
      return;
    }

    const subscription = await stripe.subscriptions.retrieve(
      invoice.subscription as string
    );
    const stripeCustomerId = invoice.customer as string;

    const user = await prisma.user.findUnique({
      where: { stripeId: stripeCustomerId },
      include: { subscription: true },
    });

    if (!user) {
      console.error(
        `User not found for stripe customer id ${stripeCustomerId}`
      );
      return;
    }

    const priceId = invoice.lines.data[0]?.price?.id;

    if (!priceId) {
      console.error(`No price id found for invoice ${invoice.id}`);
      return;
    }

    const planId = Object.entries(paymentPlans).find(
      ([_, plan]) => plan.getStripePriceId() === priceId
    )?.[0] as PaymentPlanId | undefined;

    if (!planId) {
      console.error(`No plan found for price id ${priceId}`);
      return;
    }

    if (user.subscription) {
      await prisma.subscription.update({
        where: { id: user.subscription.id },
        data: {
          status: subscription.status,
          planName: planId,
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        },
      });
      console.log(
        `Subscription updated for user ${user.id}, new plan: ${planId}`
      );
    } else {
      await prisma.subscription.create({
        data: {
          userId: user.id,
          stripeSubscriptionId: subscription.id,
          status: subscription.status,
          planName: planId,
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        },
      });
      console.log(
        `New subscription created for user ${user.id}, plan: ${planId}`
      );
    }
  } catch (error) {
    console.error("Error handling invoice paid:", error);
  }
};

export const handleInvoicePaymentFailed = async (invoice: Stripe.Invoice) => {
  try {
    if (!invoice.subscription) {
      console.log("Failed invoice is not associated with a subscription");
      return;
    }

    const stripeSubscriptionId = invoice.subscription as string;
    const stripeCustomerId = invoice.customer as string;

    const subscription = await prisma.subscription.findUnique({
      where: { stripeSubscriptionId },
      include: { user: true },
    });

    if (!subscription) {
      console.error(
        `Subscription not found for Stripe subscription ID: ${stripeSubscriptionId}`
      );
      return;
    }

    if (subscription.user.stripeId !== stripeCustomerId) {
      console.error(`Mismatch between subscription user and invoice customer`);
      return;
    }

    await emailService.sendPaymentPastDueEmail({
      userEmail: subscription.user.email,
    });
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: "past_due",
      },
    });

    console.log(
      `Subscription status updated to past_due for user ${subscription.userId}`
    );
  } catch (error) {
    console.error("Error handling invoice payment failed:", error);
  }
};

export const handleSubscriptionDeleted = async (
  subscription: Stripe.Subscription
) => {
  try {
    const stripeCustomerId = subscription.customer as string;

    const user = await prisma.user.findUnique({
      where: { stripeId: stripeCustomerId },
      include: { subscription: true },
    });

    if (!user) {
      console.error(
        `User not found for stripe customer id ${stripeCustomerId}`
      );
      return;
    }

    if (user.subscription) {
      await prisma.subscription.delete({
        where: { id: user.subscription.id },
      });
      console.log(`Subscription deleted for user ${user.id}`);

      // Optionally, send email
    } else {
      console.log(`No active subscription found for user ${user.id}`);
    }
  } catch (error) {
    console.error("Error handling subscription deleted:", error);
  }
};
