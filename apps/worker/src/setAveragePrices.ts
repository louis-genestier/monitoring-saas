import { subDays } from "date-fns";
import logger from "./utils/logger";
import { prisma } from "./utils/prisma";
import { ProductWithPricepoint } from "@repo/prisma-client";

const BATCH_SIZE = 50;

const getProductsWithLast3DaysPricePoints = async () => {
  const threeDaysAgo = subDays(new Date(), 3);

  return await prisma.product.findMany({
    include: {
      PricePoint: {
        where: {
          timestamp: {
            gte: threeDaysAgo,
          },
        },
        orderBy: {
          timestamp: "desc",
        },
      },
    },
  });
};

const processBatch = async (batch: ProductWithPricepoint[]) => {
  await Promise.all(batch.map(setAveragePrices));
};

const setAveragePrices = async (product: ProductWithPricepoint) => {
  const pricePoints = product.PricePoint;

  if (pricePoints.length === 0) {
    logger.warn(
      `No price points found for ${product.name} (ID: ${product.id})`
    );
    return;
  }

  // Calculate the average price
  const totalPrice = pricePoints.reduce(
    (acc, pricePoint) => acc + pricePoint.price,
    0
  );
  const averagePrice = totalPrice / pricePoints.length;

  // Round to 2 decimal places
  const roundedAveragePrice = Math.round(averagePrice * 100) / 100;

  const significantChange =
    Math.abs(roundedAveragePrice - (product.averagePrice ?? 0)) > 0.01;

  if (!significantChange) {
    logger.info(
      `No significant change in average price for ${product.name} (ID: ${product.id})`
    );
    return;
  }

  try {
    await prisma.product.update({
      where: { id: product.id },
      data: { averagePrice: roundedAveragePrice },
    });

    logger.info(
      `Updated average price for ${product.name} (ID: ${product.id}): ${roundedAveragePrice}€`
    );
  } catch (error) {
    logger.error(
      `Failed to update average price for ${product.name} (ID: ${product.id}): ${error}`
    );
  }
};

const main = async () => {
  const start = performance.now();
  try {
    logger.info("Starting worker");
    const products = await getProductsWithLast3DaysPricePoints();

    logger.info(`Found ${products.length} products`);
    logger.info(
      `Estimated batches: ${Math.ceil(products.length / BATCH_SIZE)}`
    );

    for (let i = 0; i < products.length; i += BATCH_SIZE) {
      const batch = products.slice(i, i + BATCH_SIZE);
      logger.info(`Processing batch ${i / BATCH_SIZE + 1}`);
      await processBatch(batch);
    }

    logger.info(`Worker finished in ${performance.now() - start}ms`);
  } catch (error) {
    logger.error(`Error in main: ${error}`);
  } finally {
    await prisma.$disconnect();
  }
};

main().catch((error) => {
  logger.error("Unhandled error in main:", error);
  process.exit(1);
});
