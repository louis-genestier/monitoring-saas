import axios, { isAxiosError } from "axios";
import * as cheerio from "cheerio";
import { HttpsProxyAgent } from "https-proxy-agent";
import logger from "../logger";
import { MOBILE_PROXY_URL } from "../env";
import { randomUserAgent } from "../randomUserAgent";

export const getAmazonProduct = async (keywords: string) => {
  try {
    const viewportWidth = Math.floor(Math.random() * 1000) + 1000;

    const response = await axios({
      method: "post",
      url: "https://www.amazon.fr/s/query",
      params: {
        k: keywords,
        page: "1",
        ref: "sr_st_relevanceblender",
        s: "relevanceblender",
      },
      headers: {
        accept: "text/html,*/*",
        "accept-language": "fr-FR,en-US;q=0.9,en;q=0.8",
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
        "sec-ch-viewport-width": `${viewportWidth}`,
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "user-agent": randomUserAgent(),
        "viewport-width": `${viewportWidth}`,
        "x-requested-with": "XMLHttpRequest",
      },
      data: {
        "customer-action": "query",
      },
      httpsAgent: new HttpsProxyAgent(MOBILE_PROXY_URL),
      httpAgent: new HttpsProxyAgent(MOBILE_PROXY_URL),
    });

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

      const productName = $(".s-title-instructions-style h2 span")
        .last()
        .text()
        .trim();
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
    if (isAxiosError(e)) {
      logger.error(
        `Failed to fetch Amazon product: ${e.response?.status} for ${keywords}`
      );
      logger.error({ data: e.response?.data });
      return;
    }
    logger.error(`Failed to fetch Amazon product: ${e} for ${keywords}`);
    return;
  }
};
