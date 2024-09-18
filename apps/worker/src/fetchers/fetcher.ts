import { JsonValue } from "@repo/prisma-client/src/generated/client/runtime/library";
import axios from "../utils/axios";
import { AxiosRequestConfig } from "axios";

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

  const response = await axios.get<T>(fullUrl, axiosOptions);

  return response.data;
};
