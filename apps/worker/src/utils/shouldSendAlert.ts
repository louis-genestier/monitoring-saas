import { PricePoint, TrackedProductWithAlert } from "@repo/prisma-client";
import logger from "./logger";

export const shouldSendAlert = (
  currentPrice: number,
  previousPricePoint: PricePoint | null,
  trackedProduct: TrackedProductWithAlert
) => {
  if (!trackedProduct.Alert || trackedProduct.Alert.length === 0) {
    return true;
  }

  if (
    previousPricePoint?.price &&
    previousPricePoint.price < trackedProduct.threshold &&
    currentPrice < trackedProduct.threshold
  ) {
    logger.info({
      message: `Not sending alert because the previous price point is lower than the threshold`,
      productId: trackedProduct.productId,
      previousPricePoint: previousPricePoint.price,
      currentPrice: currentPrice,
      threshold: trackedProduct.threshold,
    });
    return false;
  }

  return currentPrice < trackedProduct.threshold;
};
