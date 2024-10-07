import axios from "axios";
import logger from "../logger";
type CulturaResponse = {
  data: {
    products: {
      items: Array<{
        name: string;
        sku: string;
        url_key: string;
        price_range: {
          minimum_price: {
            regular_price: {
              value: number;
              currency: string;
            };
          };
        };
      }>;
      total_count: number;
    };
  };
};

export const getCulturaProduct = async (keywords: string) => {
  const query = `{
          products(
            search: "${keywords}",
            pageSize: 20,
            sort: { position: ASC }
          ) {
            items {
              name
              url_key
              sku
              price_range {
                minimum_price {
                  regular_price {
                    value
                    currency
                  }
                }
              }
            }
            total_count
          }
        }`;

  try {
    const response = await axios<CulturaResponse>({
      method: "get",
      url: "https://www.cultura.com/magento/graphql",
      params: {
        query: query,
      },
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
        "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
        authorization: "",
        "cache-control": "no-cache",
        pragma: "no-cache",
        priority: "u=1, i",
        "raised-by": "React-cartContext-Header-MyCart",
        "sec-ch-device-memory": "8",
        "sec-ch-ua":
          '"Chromium";v="128", "Not;A=Brand";v="24", "Google Chrome";v="128"',
        "sec-ch-ua-arch": '"arm"',
        "sec-ch-ua-full-version-list":
          '"Chromium";v="128.0.6613.120", "Not;A=Brand";v="24.0.0.0", "Google Chrome";v="128.0.6613.120"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-model": '""',
        "sec-ch-ua-platform": '"macOS"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
      },
      data: {},
    });

    if (
      response.status !== 200 ||
      response.data.data.products.total_count === 0
    ) {
      logger.error(
        `Failed to fetch Cultura product: ${response.status} for ${keywords}`
      );
      return;
    }

    return {
      websiteName: "cultura",
      id: response.data.data.products.items[0].sku,
      price:
        response.data.data.products.items[0].price_range.minimum_price
          .regular_price.value,
      name: response.data.data.products.items[0].name,
      link: `https://www.cultura.com/p-${response.data.data.products.items[0].url_key}.html`,
    };
  } catch (error) {
    logger.error(`Failed to fetch Cultura product: ${error} for ${keywords}`);
    return;
  }
};
