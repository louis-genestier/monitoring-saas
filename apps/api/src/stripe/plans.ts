import {
  STRIPE_BASIC_PRICE_ID,
  STRIPE_PREMIUM_PRICE_ID,
  STRIPE_STANDARD_PRICE_ID,
} from "@/config/env";
import { PaymentPlan, PaymentPlanId } from "@/types/stripe";

export const paymentPlans: Record<PaymentPlanId, PaymentPlan> = {
  [PaymentPlanId.Basic]: {
    getStripePriceId: () => STRIPE_BASIC_PRICE_ID,
  },
  [PaymentPlanId.Standard]: {
    getStripePriceId: () => STRIPE_STANDARD_PRICE_ID,
  },
  [PaymentPlanId.Premium]: {
    getStripePriceId: () => STRIPE_PREMIUM_PRICE_ID,
  },
};
