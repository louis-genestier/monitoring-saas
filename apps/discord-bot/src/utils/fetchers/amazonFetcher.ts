import axios from "axios";
import * as cheerio from "cheerio";
import { HttpsProxyAgent } from "https-proxy-agent";
import logger from "../logger";
import { MOBILE_PROXY_URL } from "../env";

export const getAmazonProduct = async (keywords: string) => {
  try {
    const response = await axios({
      method: "post",
      url: "https://www.amazon.fr/s/query",
      params: {
        ds: "v1:NifIuRKB0alHmmQR6IL1+cZHrpTMXTAzABUt6oao4TY",
        k: keywords,
        page: "1",
        qid: "1728208225",
        ref: "sr_st_relevanceblender",
        s: "relevanceblender",
      },
      headers: {
        accept: "text/html,*/*",
        "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
        "cache-control": "no-cache",
        "content-type": "application/json",
        "device-memory": "8",
        downlink: "10",
        dpr: "2",
        ect: "4g",
        origin: "https://www.amazon.fr",
        pragma: "no-cache",
        priority: "u=1, i",
        rtt: "0",
        "sec-ch-device-memory": "8",
        "sec-ch-dpr": "2",
        "sec-ch-ua":
          '"Google Chrome";v="129", "Not=A?Brand";v="8", "Chromium";v="129"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
        "sec-ch-ua-platform-version": '"14.6.1"',
        "sec-ch-viewport-width": "1728",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
        "viewport-width": "1728",
        "x-requested-with": "XMLHttpRequest",
      },
      data: {
        "customer-action": "query",
      },
      httpsAgent: new HttpsProxyAgent(MOBILE_PROXY_URL),
    });

    if (response.status !== 200) {
      logger.error(
        `Failed to fetch Amazon product: ${response.status} for ${keywords}`
      );
      return;
    }

    const data = response.data.split("&&&");
    const searchResult = data.find((d) => {
      try {
        const [, id, { html }] = JSON.parse(d);
        return (
          id.includes("search-result-") &&
          !html.includes("Publicité sponsorisée")
        );
      } catch (error) {
        return false;
      }
    });

    if (searchResult) {
      const [, id, { html, asin }] = JSON.parse(searchResult);

      const $ = cheerio.load(html);
      const productName = $("h2 span.a-size-base-plus").text().trim();
      const price =
        $("span.a-price-whole").first().text().trim() +
        $("span.a-price-fraction").first().text().trim() +
        $("span.a-price-symbol").first().text().trim();

      return {
        websiteName: "amazon",
        name: productName,
        id: asin,
        price,
        link: `https://www.amazon.fr/dp/${asin}`,
      };
    } else {
      logger.error(
        `Failed to fetch Amazon product: no search result for ${keywords}`
      );
      return;
    }
  } catch (e) {
    logger.error(`Failed to fetch Amazon product: ${e} for ${keywords}`);
    return;
  }
};
