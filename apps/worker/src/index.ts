import { AlertStatus, PricePoint, PriceType } from "@repo/prisma-client";
import { fetchFnacPrice } from "./fetchers/fnacFetcher";
import { fetchRakutenPrice } from "./fetchers/rakutenFetcher";
import logger from "./utils/logger";
import { prisma } from "./utils/prisma";
import { shouldSendAlert } from "./utils/shouldSendAlert";
import { sendEmail } from "./utils/mailer";
import { fetchCulturaPrice } from "./fetchers/culturaFetcher";
import { fetchLeclercPrice } from "./fetchers/leclercFetcher";
import { fetchLdlcPrice } from "./fetchers/ldlcFetcher";

const createPricePointAndCheckAlert = async (
  product: { id: string; name: string },
  price: number,
  websiteId: string,
  websiteName: string,
  priceType: PriceType,
  baseUrl: string,
  externalId: string,
  ean?: string
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
      priceType,
      baseUrl,
      websiteName,
      externalId,
      ean
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
  kind: PriceType,
  baseUrl: string,
  websiteName: string,
  externalId: string,
  ean?: string
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
        user: true,
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

        let productUrl = `${baseUrl}${externalId}`;

        if (websiteName === "fnac") {
          // product for api is 1234-1 but for website is a1234
          const id = `a${externalId.split("-")[0]}`;
          productUrl = `${baseUrl}${id}`;
        }

        if (websiteName === "cultura") {
          // not using externalId because we need to use ean from the response
          productUrl = `${baseUrl}a-${ean}.html`;
        }

        if (websiteName === "ldlc") {
          productUrl = `${baseUrl}${externalId}.html`;
        }

        await sendEmail({
          to: trackedProduct.user.email,
          subject: `Alerte DealZap: ${product.name} à ${price}€`,
          text: `Bonjour,\n\nLe produit ${product.name} est disponible à ${price}€ sur ${websiteName}, vous pouvez y accéder ici ${productUrl}.`,
        });

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
        apiBaseUrl: productId.website.apiBaseurl,
        productExternalId: productId.externalId,
        headers: productId.website.headers,
        parameters: productId.website.parameters,
        websiteId: productId.websiteId,
        baseUrl: productId.website.baseUrl,
      }));
      logger.info(`${websites.length} websites found for ${product.name}`);

      for (const website of websites) {
        try {
          logger.info(`Fetching price for ${product.name} on ${website.name}`);
          let prices:
            | {
                new: number | undefined;
                used: number | undefined;
                ean?: string;
              }
            | undefined = undefined;

          switch (website.name) {
            case "fnac":
              prices = await fetchFnacPrice({
                id: website.productExternalId,
                apiBaseUrl: website.apiBaseUrl,
                headers: website.headers,
              });
              break;
            case "rakuten":
              prices = await fetchRakutenPrice({
                id: website.productExternalId,
                apiBaseUrl: website.apiBaseUrl,
                headers: website.headers,
                parameters: website.parameters!,
              });
              break;
            case "cultura":
              prices = await fetchCulturaPrice({
                id: website.productExternalId,
                apiBaseUrl: website.apiBaseUrl,
                headers: website.headers,
                parameters: website.parameters!,
              });
              break;
            case "leclerc":
              prices = await fetchLeclercPrice({
                id: website.productExternalId,
                apiBaseUrl: website.apiBaseUrl,
              });
              break;
            case "ldlc":
              prices = await fetchLdlcPrice({
                id: website.productExternalId,
                apiBaseUrl: website.apiBaseUrl,
                headers: website.headers,
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
                website.name,
                PriceType.NEW,
                website.baseUrl,
                website.productExternalId,
                prices.ean
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
                website.name,
                PriceType.USED,
                website.baseUrl,
                website.productExternalId,
                prices.ean
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
  const start = performance.now();
  try {
    logger.info("Starting worker");
    await fetchPrices();
  } catch (error) {
    logger.error(`Error in main process: ${error}`);
  } finally {
    const end = performance.now();

    logger.info(`Worker finished in ${(end - start) / 1000} seconds`);
  }
};

main();

// const main = async () => {
//   const resp = await fetcher(
//     "https://www.cultura.com/magento/graphql",
//     {
//       "Content-Type": "application/json",
//       accept: "application/json",
//       "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
//       "user-agent":
//         "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
//     },
//     "3982680",
//     'query={products(filter:{sku:{eq:"ID_TO_REPLACE"}}){items{ean stock_status url_suffix price_range{minimum_price{final_price{value}}}}}}'
//   );

//   console.log(resp);
// };

// main();
