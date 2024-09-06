import {
  AlertStatus,
  PricePoint,
  PriceType,
  TrackedProductWithAlert,
} from "@repo/prisma-client";
import { fetchFnacPrice } from "./fetchers/fnacFetcher";
import { fetchRakutenPrice } from "./fetchers/rakutenFetcher";
import logger from "./utils/logger";
import { prisma } from "./utils/prisma";

const createPricePointAndCheckAlert = async (
  product: { id: string; name: string },
  price: number,
  websiteId: string,
  priceType: PriceType
) => {
  const previousPricePoint = await prisma.pricePoint.findFirst({
    where: {
      productId: product.id,
      websiteId: websiteId,
      priceType: priceType,
    },
    orderBy: {
      timestamp: "desc",
    },
  });
  const pricePoint = await prisma.pricePoint.create({
    data: {
      productId: product.id,
      price,
      websiteId,
      priceType,
      timestamp: new Date(),
    },
  });

  await checkAlert(product, price, previousPricePoint, pricePoint, priceType);
};

const shouldSendAlert = (
  previousPricePoint: PricePoint | null,
  trackedProduct: TrackedProductWithAlert
) => {
  // since we have no alert or price point for this trackedProduct we can send an alert -> first time
  if (trackedProduct.Alert.length === 0 || !previousPricePoint) {
    logger.info(
      `No alert or price point for ${trackedProduct.priceType === PriceType.NEW ? "(new)" : "(used)"}`
    );
    return true;
  }

  // if the latest price point is already lower than the trackedProduct threshold
  // we don't need to send an alert
  if (previousPricePoint.price < trackedProduct.threshold) {
    return false;
  }

  // if the latest price point is higher than the trackedProduct threshold
  // we need to send an alert
  return true;
};

const checkAlert = async (
  product: { id: string; name: string },
  price: number,
  previousPricePoint: PricePoint | null,
  latestPricePoint: PricePoint,
  kind: PriceType
) => {
  const trackedProducts = await prisma.trackedProduct.findMany({
    where: {
      productId: product.id,
      priceType: kind,
      isEnabled: true,
      threshold: {
        gt: price,
      },
    },
    include: {
      Alert: true,
    },
  });

  if (trackedProducts.length === 0) {
    logger.info(
      `No tracked products found for ${product.name} with price ${price}€`
    );
    return;
  }

  logger.info(
    `Found ${trackedProducts.length} tracked products for ${product.name} with price ${price}€`
  );

  for (const trackedProduct of trackedProducts) {
    const shouldSendAlertResult = shouldSendAlert(
      previousPricePoint,
      trackedProduct
    );

    if (shouldSendAlertResult) {
      await prisma.alert.create({
        data: {
          trackedProductId: trackedProduct.id,
          status: AlertStatus.SENT,
          pricePointId: latestPricePoint.id,
          alertProviderId: trackedProduct.alertProviderId,
        },
      });

      // TODO: send notification

      logger.info(
        `Sent alert for ${product.name} ${kind === PriceType.NEW ? "(new)" : "(used)"} under ${price}€`
      );
    } else {
      logger.info(
        `Not sending alert for ${product.name} ${kind === PriceType.NEW ? "(new)" : "(used)"} under ${price}€`
      );
    }
  }
};

const fetchPrices = async () => {
  // TODO: first only get products that are tracked then after get other products
  const products = await prisma.product.findMany({
    include: {
      ProductId: {
        include: {
          website: true,
        },
      },
    },
  });

  logger.info(`Found ${products.length} products`);

  for (const product of products) {
    const websites = product.ProductId.map((productId) => ({
      name: productId.website.name,
      url: productId.website.apiBaseurl,
      productId: productId.externalId,
      headers: productId.website.headers,
      parameters: productId.website.parameters,
      websiteId: productId.websiteId,
    }));
    logger.info(`${websites.length} websites found for ${product.name}`);

    for (const website of websites) {
      logger.info(`Fetching price for ${product.name} on ${website.name}`);
      let prices:
        | { new: number | undefined; used: number | undefined }
        | undefined = undefined;

      switch (website.name) {
        case "fnac":
          prices = await fetchFnacPrice({
            id: website.productId,
            url: website.url,
            headers: website.headers,
          });
          break;
        case "rakuten":
          prices = await fetchRakutenPrice({
            id: website.productId,
            url: website.url,
            headers: website.headers,
            parameters: website.parameters!,
          });
          break;
        default:
          logger.error(`Unsupported website: ${website.name}`);
          break;
      }

      if (prices?.new || prices?.used) {
        if (prices.new) {
          logger.info({
            website: website.name,
            productName: product.name,
            price: prices.new,
            priceType: PriceType.NEW,
          });

          createPricePointAndCheckAlert(
            product,
            prices.new,
            website.websiteId,
            PriceType.NEW
          );

          // const previousNewPricePoint = await prisma.pricePoint.findFirst({
          //   where: {
          //     productId: product.id,
          //     websiteId: website.websiteId,
          //     priceType: PriceType.NEW,
          //   },
          //   orderBy: {
          //     timestamp: "desc",
          //   },
          // });

          //   const createdPricePoint = await prisma.pricePoint.create({
          //     data: {
          //       productId: product.id,
          //       price: prices.new,
          //       websiteId: website.websiteId,
          //       timestamp: new Date(),
          //       priceType: PriceType.NEW,
          //     },
          //   });

          //   await checkAlert(
          //     product,
          //     prices.new,
          //     previousNewPricePoint,
          //     createdPricePoint,
          //     PriceType.NEW
          //   );
        }

        if (prices.used) {
          logger.info({
            website: website.name,
            productName: product.name,
            price: prices.used,
            priceType: PriceType.USED,
          });

          createPricePointAndCheckAlert(
            product,
            prices.used,
            website.websiteId,
            PriceType.USED
          );
          // const latestUsedPricePoint = await prisma.pricePoint.findFirst({
          //   where: {
          //     productId: product.id,
          //     websiteId: website.websiteId,
          //     priceType: PriceType.USED,
          //   },
          //   orderBy: {
          //     timestamp: "desc",
          //   },
          // });

          //   const createdPricePoint = await prisma.pricePoint.create({
          //     data: {
          //       productId: product.id,
          //       price: prices.used,
          //       websiteId: website.websiteId,
          //       timestamp: new Date(),
          //       priceType: PriceType.USED,
          //     },
          //   });

          //   await checkAlert(
          //     product,
          //     prices.used,
          //     latestUsedPricePoint,
          //     createdPricePoint,
          //     PriceType.USED
          //   );
        }
      }
    }
  }
};

const main = async () => {
  logger.info("Starting worker");
  await fetchPrices();
};

main();
