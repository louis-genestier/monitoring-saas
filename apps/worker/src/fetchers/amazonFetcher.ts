import { JsonValue } from "@repo/prisma-client/src/generated/client/runtime/library";
import { fetcher } from "./fetcher";
import logger from "../utils/logger";
import * as cheerio from "cheerio";

// type ItemResponse = {
//   ASIN: string;
//   Type: string;
//   sortOfferInfo: string;
//   isPrimeEligible: string;
//   Value: {
//     content: {
//       twisterSlotJson: {
//         isAvailable: boolean;
//         price: string;
//       };
//       twisterSlotDiv: string;
//     };
//   };
// };

export const fetchAmazonPrice = async ({
  id,
  apiBaseUrl,
  parameters,
  headers,
  retries = 0,
}: {
  id: string;
  apiBaseUrl: string;
  parameters: string;
  headers: JsonValue;
  retries?: number;
}) => {
  try {
    const html = await fetcher<string>(
      apiBaseUrl,
      headers,
      id,
      parameters.replaceAll(/ID_TO_REPLACE/gi, id)
    );

    const $ = cheerio.load(html);

    const priceElement = $("span .centralizedApexPricePriceToPayMargin")
      .first()
      .text()
      .trim();

    if (!priceElement && retries < 3) {
      logger.warn(`No price found for Amazon product ${id}, retry ${retries}`);
      // retry this fetcher

      return await fetchAmazonPrice({
        id,
        apiBaseUrl,
        parameters,
        headers,
        retries: retries + 1,
      });
    }

    if (priceElement) {
      const price = parseFloat(
        priceElement.replace(",", ".").replace("€", "").replace(/\s/g, "")
      );

      console.log("price", price);

      if (!isNaN(price)) {
        logger.info(`Found price for Amazon product ${id}: ${price}`);
        return {
          new: price,
          used: undefined,
        };
      }
    }

    logger.warn(`No price found for Amazon product ${id}`);
    return {
      new: undefined,
      used: undefined,
    };
  } catch (error: any) {
    if (error.response) {
      logger.error(`Error fetching Amazon price: ${error.response.status}`);
    }

    throw error;
  }
};
