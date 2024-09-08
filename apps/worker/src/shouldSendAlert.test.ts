import { expect, test } from "vitest";
import { shouldSendAlert } from "./utils/shouldSendAlert";
import {
  PricePoint,
  PriceType,
  TrackedProductWithAlert,
  Website,
} from "@repo/prisma-client";

const trackedProductWithNoAlert = {
  Alert: [],
  id: "1",
  userId: "1",
  productId: "1",
  createdAt: new Date(),
  updatedAt: new Date(),
  threshold: 100,
  alertProviderId: "1",
  isEnabled: true,
  priceType: PriceType.NEW,
} as TrackedProductWithAlert;

test("if no alert, should send alert", () => {
  expect(shouldSendAlert(90, null, trackedProductWithNoAlert)).toBe(true);
});

test("if latest price point is lower than threshold, should send alert", () => {
  expect(shouldSendAlert(90, null, trackedProductWithNoAlert)).toBe(true);
});

test("if the current price is lower than the threshold but the previous price point is lower than the threshold, should not send alert", () => {
  const previousPricePoint = {
    price: 95,
  } as PricePoint;
  expect(
    shouldSendAlert(91, previousPricePoint, {
      ...trackedProductWithNoAlert,
      Alert: [{ id: "1" }],
    } as TrackedProductWithAlert)
  ).toBe(false);
});

test("if the latest price point is lower than the threshold but the previous price point is higher than the threshold, should send alert", () => {
  const previousPricePoint = {
    price: 100,
  } as PricePoint;
  expect(
    shouldSendAlert(90, previousPricePoint, trackedProductWithNoAlert)
  ).toBe(true);
});
