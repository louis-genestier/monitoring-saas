import { AlertStatus, PricePoint, PriceType } from "@repo/prisma-client";
import { fetchFnacPrice } from "./fetchers/fnacFetcher";
import { fetchRakutenPrice } from "./fetchers/rakutenFetcher";
import logger from "./utils/logger";
import { prisma } from "./utils/prisma";
import { shouldSendAlert } from "./utils/shouldSendAlert";

const createPricePointAndCheckAlert = async (
  product: { id: string; name: string },
  price: number,
  websiteId: string,
  priceType: PriceType
) => {
  try {
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
    const createdPricePoint = await prisma.pricePoint.create({
      data: {
        productId: product.id,
        price,
        websiteId,
        priceType,
        timestamp: new Date(),
      },
    });

    await checkAlert(
      product,
      price,
      previousPricePoint,
      createdPricePoint,
      priceType
    );
  } catch (error) {
    logger.error(`Error in createPricePointAndCheckAlert: ${error}`);
  }
};

const checkAlert = async (
  product: { id: string; name: string },
  price: number,
  previousPricePoint: PricePoint | null,
  createdPricePoint: PricePoint,
  kind: PriceType
) => {
  try {
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
        price,
        previousPricePoint,
        trackedProduct
      );

      if (shouldSendAlertResult) {
        await prisma.alert.create({
          data: {
            trackedProductId: trackedProduct.id,
            status: AlertStatus.SENT,
            pricePointId: createdPricePoint.id,
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
  } catch (error) {
    logger.error(`Error in checkAlert: ${error}`);
  }
};

const fetchPrices = async () => {
  try {
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
        try {
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

              await createPricePointAndCheckAlert(
                product,
                prices.new,
                website.websiteId,
                PriceType.NEW
              );
            }

            if (prices.used) {
              logger.info({
                website: website.name,
                productName: product.name,
                price: prices.used,
                priceType: PriceType.USED,
              });

              await createPricePointAndCheckAlert(
                product,
                prices.used,
                website.websiteId,
                PriceType.USED
              );
            }
          }
        } catch (error) {
          logger.error(`Error processing website ${website.name}: ${error}`);
        }
      }
    }
  } catch (error) {
    logger.error(`Error in fetchPrices: ${error}`);
  }
};

const main = async () => {
  try {
    logger.info("Starting worker");
    await fetchPrices();
  } catch (error) {
    logger.error(`Error in main process: ${error}`);
  }
};

main();
