import { JsonValue } from "@repo/prisma-client/src/generated/client/runtime/library";
import axios, {
  axiosInstanceWithResidentialProxy,
  axiosInstanceWithDatacenterProxy,
} from "../utils/axios";
import { AxiosRequestConfig, AxiosResponse } from "axios";
import { randomUserAgent } from "../utils/randomUserAgent";
import logger from "../utils/logger";
import { add } from "date-fns";

export const fetcher = async <T>(
  url: string,
  headers: JsonValue,
  id: string,
  parameters?: string
): Promise<T> => {
  const axiosHeaders =
    headers instanceof Headers
      ? Object.fromEntries(headers.entries())
      : headers;

  let axiosOptions: AxiosRequestConfig = {
    headers: axiosHeaders as Record<string, string>,
  };

  let fullUrl = `${url}${id}${parameters ? `?${parameters}` : ""}`;

  if (url.includes("cultura")) {
    fullUrl = `${url}?${parameters?.replace(/ID_TO_REPLACE/, id)}`;
    axiosOptions.data = {};
  }

  if (url.includes("amazon")) {
    fullUrl = `${url}?${parameters}`;
    logger.info({
      message: `DEBUG::: Fetching Amazon price for ${id} at ${fullUrl}`,
      additionalInfo: { parameters, headers, id },
    });
  }

  let response: AxiosResponse<T>;

  if (url.includes("ldlc")) {
    response = await axios.post<T>(fullUrl, null, axiosOptions);
  } else if (url.includes("amazon") || url.includes("cultura")) {
    response = await axiosInstanceWithDatacenterProxy.get<T>(fullUrl, {
      headers: {
        ...axiosOptions.headers,
        "User-Agent": randomUserAgent(),
      },
    });
  } else if (url.includes("rakuten")) {
    response = await axiosInstanceWithResidentialProxy.get<T>(fullUrl, {
      headers: {
        ...axiosOptions.headers,
        "User-Agent": randomUserAgent(),
      },
    });
  } else {
    response = await axios.get<T>(fullUrl, axiosOptions);
  }

  return response.data;
};
