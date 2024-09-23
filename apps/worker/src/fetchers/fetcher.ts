import { JsonValue } from "@repo/prisma-client/src/generated/client/runtime/library";
import axios, { axiosInstanceWithProxy } from "../utils/axios";
import { AxiosRequestConfig, AxiosResponse } from "axios";
import { HttpsProxyAgent } from "https-proxy-agent";
import { randomUserAgent } from "../utils/randomUserAgent";

export const fetcher = async <T>(
  url: string,
  headers: JsonValue,
  id: string,
  parameters?: string,
  proxy?: {
    ip: string;
    username: string;
    password: string;
  }
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
  }

  let response: AxiosResponse<T>;

  if (url.includes("ldlc")) {
    response = await axios.post<T>(fullUrl, null, axiosOptions);
  } else if (url.includes("amazon")) {
    response = await axios.get<T>(fullUrl, {
      httpsAgent: new HttpsProxyAgent(
        `http://${proxy?.username}:${proxy?.password}@${proxy?.ip}`
      ),
      headers: { ...axiosOptions.headers, "User-Agent": randomUserAgent() },
    });
  } else if (url.includes("rakuten")) {
    response = await axios.get<T>(fullUrl, {
      httpsAgent: new HttpsProxyAgent(
        `http://${proxy?.username}:${proxy?.password}@${proxy?.ip}`
      ),
      headers: { ...axiosOptions.headers },
    });
  } else {
    response = await axios.get<T>(fullUrl, axiosOptions);
  }

  return response.data;
};
