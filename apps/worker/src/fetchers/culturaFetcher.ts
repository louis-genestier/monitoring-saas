import { JsonValue } from "@repo/prisma-client/src/generated/client/runtime/library";
import { fetcher } from "./fetcher";

type ItemResponse = {
  data: {
    products: {
      items: Array<{
        ean: string;
        stock_status: string;
        url_suffix: string;
        price_range: {
          minimum_price: {
            final_price: {
              value: number;
            };
          };
        };
      }>;
    };
  };
};

export const fetchCulturaPrice = async ({
  id,
  apiBaseUrl,
  headers,
  parameters,
}: {
  id: string;
  apiBaseUrl: string;
  headers: JsonValue;
  parameters: string;
}) => {
  const item = await fetcher<ItemResponse>(apiBaseUrl, headers, id, parameters);

  return {
    new: item.data.products.items[0].price_range.minimum_price.final_price
      .value,
    used: undefined,
    ean: item.data.products.items[0].ean,
  };
};
