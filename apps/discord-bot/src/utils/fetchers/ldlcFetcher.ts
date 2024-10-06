import axios from "axios";
import * as cheerio from "cheerio";
import logger from "../logger";

export const getLdlcProduct = async (keywords: string) => {
  const formData = new FormData();
  formData.append("searchText", keywords);
  formData.append("universe", "all");

  try {
    const response = await axios<string>({
      method: "post",
      url: `https://www.ldlc.com/v4/fr-fr/search/autocomplete/${keywords}`,
      headers: {
        accept: "*/*",
        "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
        "cache-control": "no-cache",
        origin: "https://www.ldlc.com",
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
        "x-requested-with": "XMLHttpRequest",
      },
      data: formData,
    });

    if (response.status !== 200) {
      logger.error(
        `Failed to fetch LDLC product: ${response.status} for ${keywords}`
      );
      return;
    }

    // parse html response
    const $ = cheerio.load(response.data);

    const firstProduct = $(".pdt-item").first();

    if (firstProduct) {
      const name = firstProduct.find(".name p").text().trim();
      const url = firstProduct.find("a").attr("href");
      const priceText = firstProduct.find(".price").text().trim();
      const price = parseFloat(
        priceText.replace("€", ".").replace("\u00A0", "")
      );

      return {
        name,
        id: url?.split("/")?.pop()?.split(".")[0],
        price: price.toFixed(2),
        link: url,
      };
    }

    logger.error(`Failed to find LDLC first product for ${keywords}`);
    return undefined;
  } catch (error) {
    logger.error(`Failed to fetch LDLC product: ${error} for ${keywords}`);
    return;
  }
};
