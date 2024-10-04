import {
  AlertStatus,
  PriceType,
  ExternalProductWithAllRelations,
} from "@repo/prisma-client";
import { fetchFnacPrice } from "./fetchers/fnacFetcher";
import { fetchRakutenPrice } from "./fetchers/rakutenFetcher";
import logger from "./utils/logger";
import { prisma } from "./utils/prisma";
import { fetchCulturaPrice } from "./fetchers/culturaFetcher";
import { fetchLeclercPrice } from "./fetchers/leclercFetcher";
import { fetchLdlcPrice } from "./fetchers/ldlcFetcher";
import { fetchAmazonPrice } from "./fetchers/amazonFetcher";
import { isAxiosError } from "axios";
import { differenceInHours } from "date-fns";
import { sendDiscordMessage } from "./utils/discord";

async function retryOperation<T>(
  operation: () => Promise<T>,
  shouldRetry: (error: any) => boolean,
  maxRetries: number = 3,
  delay: number = 0
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries || !shouldRetry(error)) {
        logger.error(
          `Operation failed after ${attempt} attempt(s). Last error: ${error}`
        );
        throw error;
      }
      logger.warn(
        `Attempt ${attempt} failed: ${error}. Retrying in ${delay}ms...`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error("This should never happen due to the throw in the for loop");
}

const BATCH_SIZE = 10;
const ALERT_COOLDOWN_HOURS = 2;
const SIGNIFICANT_PRICE_CHANGE_PERCENT = 5;

const getPrice = async (externalProduct: ExternalProductWithAllRelations) => {
  try {
    const { website, product } = externalProduct;
    logger.info(`Fetching price for ${product.name} on ${website.name}`);

    const fetchPrice = async () => {
      switch (website.name) {
        case "fnac":
          return await fetchFnacPrice({
            id: externalProduct.externalId,
            apiBaseUrl: website.apiBaseurl,
            headers: website.headers,
          });
        case "rakuten":
          return await fetchRakutenPrice({
            id: externalProduct.externalId,
            apiBaseUrl: website.apiBaseurl,
            headers: website.headers,
            parameters: website.parameters!,
          });
        case "cultura":
          return await fetchCulturaPrice({
            id: externalProduct.externalId,
            apiBaseUrl: website.apiBaseurl,
            headers: website.headers,
            parameters: website.parameters!,
          });
        case "leclerc":
          return await fetchLeclercPrice({
            id: externalProduct.externalId,
            apiBaseUrl: website.apiBaseurl,
          });
        case "ldlc":
          return await fetchLdlcPrice({
            id: externalProduct.externalId,
            apiBaseUrl: website.apiBaseurl,
            headers: website.headers,
          });
        case "amazon":
          return await fetchAmazonPrice({
            id: externalProduct.externalId,
            apiBaseUrl: website.apiBaseurl,
            parameters: website.parameters!,
            headers: website.headers,
          });
        default:
          logger.error(`Unsupported website: ${website.name}`);
          break;
      }
    };

    const shouldRetry = (error: any) => {
      if (isAxiosError(error)) {
        if (error.response?.status === 404) {
          logger.info(
            `Not retrying for ${error.response.status} error on ${website.name} for ${product.name}`
          );
          return false;
        }
        // Retry for network errors or 5xx server errors
        if (!error.response || error.response.status >= 500) {
          return true;
        }
      }
      // For non-Axios errors, you might want to retry based on your specific error types
      return true;
    };

    const prices = await retryOperation(fetchPrice, shouldRetry);

    if (!prices) {
      logger.error(`No prices found for ${product.name} on ${website.name}`);
      return;
    }

    if (!product.averagePrice && prices.new) {
      logger.info(
        `Current product ${product.name} has no average price, setting it to ${prices.new} for ${website.name}`
      );
      await prisma.product.update({
        where: {
          id: product.id,
        },
        data: {
          averagePrice: prices.new,
        },
      });

      return;
    }

    if (!prices.new) {
      logger.error(`No new price found for ${product.name} on ${website.name}`);
      return;
    }

    const newPricePoint = await prisma.pricePoint.create({
      data: {
        price: prices.new,
        priceType: PriceType.NEW,
        productId: product.id,
        websiteId: website.id,
      },
    });

    // here are the product that already have an average price and we have to compare it to get the discount
    const discountPercentage = Math.round(
      ((product.averagePrice! - prices.new) / product.averagePrice!) * 100
    );

    if (discountPercentage <= 0) {
      logger.info(
        `No discount found for ${product.name} on ${website.name}, discount is ${discountPercentage}%`
      );
      return;
    }
    logger.info(
      `Found discount of ${discountPercentage}% for ${product.name} on ${website.name}`
    );

    const recentAlert = await prisma.alert.findFirst({
      where: {
        externalProductId: externalProduct.id,
        createdAt: {
          gte: new Date(Date.now() - ALERT_COOLDOWN_HOURS * 60 * 60 * 1000),
        },
      },
      include: {
        pricePoint: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (recentAlert) {
      logger.info(
        `Last alert for ${product.name} on ${website.name} was ${differenceInHours(new Date(), recentAlert.createdAt)} ago`
      );

      const priceChangePercent = Math.abs(
        ((prices.new - recentAlert.pricePoint.price) /
          recentAlert.pricePoint.price) *
          100
      );

      if (priceChangePercent < SIGNIFICANT_PRICE_CHANGE_PERCENT) {
        logger.info(
          `Price change of ${priceChangePercent}% is not significant enough for ${product.name} on ${website.name}`
        );
        return;
      }
    }

    // send alert on discord now and set status to sent
    if (discountPercentage >= 30) {
      const alert = await prisma.alert.create({
        data: {
          externalProductId: externalProduct.id,
          status: AlertStatus.PENDING,
          pricePointId: newPricePoint.id,
          discount: discountPercentage,
        },
        include: {
          pricePoint: true,
        },
      });
      await sendDiscordMessage({
        product,
        website,
        alert,
        externalProduct,
        // @ts-ignore
        urlKey: prices.urlKey ?? undefined, // needed for cultura
      });
      await prisma.alert.update({
        where: {
          id: alert.id,
        },
        data: {
          status: AlertStatus.SENT,
        },
      });
    }
  } catch (error) {
    logger.error(`Error in getPrice: ${error}`);
  }
};

const startWorker = async () => {
  try {
    const externalProducts = await prisma.externalProduct.findMany({
      include: {
        website: true,
        product: true,
      },
      where: {
        website: {
          isEnabled: true,
        },
      },
    });

    logger.info(`Found ${externalProducts.length} external products`);
    logger.info(
      `Estimated batches: ${Math.ceil(externalProducts.length / BATCH_SIZE)}`
    );

    for (let i = 0; i < externalProducts.length; i += BATCH_SIZE) {
      const batch = externalProducts.slice(i, i + BATCH_SIZE);
      logger.info(`Processing batch ${i / BATCH_SIZE + 1}`);
      await Promise.all(batch.map(getPrice));
    }

    return;
  } catch (error) {
    logger.error(`Error in startWorker: ${error}`);
  }
};

const main = async () => {
  const start = performance.now();
  try {
    logger.info("Starting worker");
    await startWorker();
  } catch (error) {
    logger.error(`Error in main process: ${error}`);
  } finally {
    const end = performance.now();
    logger.info(`Worker finished in ${(end - start) / 1000} seconds`);
  }
};

main();
