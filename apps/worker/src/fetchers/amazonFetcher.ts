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
}: {
  id: string;
  apiBaseUrl: string;
  parameters: string;
  headers: JsonValue;
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

    if (priceElement) {
      const price = parseFloat(priceElement.replace(",", ".").replace("€", ""));

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
