import { JsonValue } from "@repo/prisma-client/src/generated/client/runtime/library";
import { fetcher } from "./fetcher";
import logger from "../utils/logger";
import { PROXY_PASSWORD } from "../utils/env";
import { proxyList } from "./proxyList";

type ItemResponse = {
  ASIN: string;
  Type: string;
  sortOfferInfo: string;
  isPrimeEligible: string;
  Value: {
    content: {
      twisterSlotJson: {
        isAvailable: boolean;
        price: string;
      };
      twisterSlotDiv: string;
    };
  };
};

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
  const proxy = {
    ...proxyList[Math.floor(Math.random() * proxyList.length)],
    password: PROXY_PASSWORD,
  };
  try {
    const item = await fetcher<ItemResponse>(
      apiBaseUrl,
      headers,
      id,
      parameters.replaceAll(/ID_TO_REPLACE/gi, id),
      proxy
    );

    return {
      new: parseFloat(item.Value.content.twisterSlotJson.price),
      used: undefined,
    };
  } catch (error: any) {
    if (error.response) {
      logger.error(
        `Error fetching Amazon price: ${error.response.status} with ip ${proxy.ip}`
      );
    }

    throw error;
  }
};
