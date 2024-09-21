import { JsonValue } from "@repo/prisma-client/src/generated/client/runtime/library";
import { fetcher } from "./fetcher";
import * as cheerio from "cheerio";

type ItemResponse = {
  listing: string;
  url: string;
  title: string;
  meta: {
    charset: {
      "utf-8": [string, Array<any>];
    };
    name: {
      viewport: [string, Array<any>];
      "theme-color": [string, Array<any>];
      robots: [string, Array<any>];
    };
    "http-equiv": {
      "X-UA-Compatible": [string, Array<any>];
    };
    property: {
      "og:title": [string, Array<any>];
    };
  };
  alternates: Array<any>;
  filterUrl: string;
  sort: any;
  page: number;
  nbResults: number;
  nbResultsTotal: number;
};

export const fetchLdlcPrice = async ({
  id,
  apiBaseUrl,
  headers,
}: {
  id: string;
  apiBaseUrl: string;
  headers: JsonValue;
}) => {
  const item = await fetcher<ItemResponse>(apiBaseUrl, headers, id);
  const $ = cheerio.load(item.listing);
  const price = $(".pdt-item .basket .price .price")
    .text()
    .trim()
    .replace("€", ".");

  const parsed = parseFloat(price);

  return {
    new: isNaN(parsed) ? undefined : parsed,
    used: undefined,
  };
};
