export enum PaymentPlanId {
  Basic = "basic",
  Standard = "standard",
  Premium = "premium",
}

export interface PaymentPlan {
  getStripePriceId: () => string;
}
