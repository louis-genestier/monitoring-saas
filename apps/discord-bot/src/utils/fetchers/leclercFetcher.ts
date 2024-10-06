import axios from "axios";
import logger from "../logger";

type LeclercResponse = {
  product: {
    items: Array<{
      type: string;
      url: string;
      imageUrl: string;
      title: {
        raw: string;
        highlighted: string;
      };
      subtitle: {
        raw: string;
        highlighted: string;
      };
      content: {};
      price: number;
    }>;
    count: number;
  };
  edito: {
    items: Array<any>;
    count: number;
  };
  term: {
    items: Array<any>;
    count: number;
  };
  bandeau_scamark: any;
  match_scamark: Array<any>;
};

export const getLeclercProduct = async (keywords: string) => {
  try {
    const response = await axios<LeclercResponse>({
      method: "post",
      url: "https://www.e.leclerc/api/rest/live-api/auto-complete",
      headers: {
        accept: "application/json, text/plain, */*",
        "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
        "cache-control": "no-cache",
        "content-type": "application/json",
        origin: "https://www.e.leclerc",
        pragma: "no-cache",
        priority: "u=1, i",
        "sec-ch-ua":
          '"Google Chrome";v="129", "Not=A?Brand";v="8", "Chromium";v="129"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
      },
      data: {
        query: keywords,
        filters: {
          "oaf-sign-code": {
            value: ["0100", "0000"],
          },
        },
        pertimmContexts: [],
      },
    });

    if (response.status !== 200 || response.data.product.count === 0) {
      logger.error(
        `Failed to fetch Leclerc product: ${response.status} for ${keywords}`
      );
      return;
    }

    return {
      id: response.data.product.items[0].url.split("-").pop(),
      price: response.data.product.items[0].price,
      name: response.data.product.items[0].title.raw,
      link: `https://www.e.leclerc${response.data.product.items[0].url}`,
    };
  } catch (error) {
    logger.error(`Failed to fetch Leclerc product: ${error} for ${keywords}`);
    return;
  }
};
