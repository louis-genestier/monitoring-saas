import { JsonValue } from "@repo/prisma-client/src/generated/client/runtime/library";
import { fetcher } from "./fetcher";

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
  const item = await fetcher<ItemResponse>(
    apiBaseUrl,
    headers,
    id,
    parameters.replaceAll(/ID_TO_REPLACE/gi, id)
  );

  return {
    new: parseFloat(item.Value.content.twisterSlotJson.price),
    used: undefined,
  };
};
