import { JsonValue } from "@repo/prisma-client/src/generated/client/runtime/library";
import axios from "../utils/axios";

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

  const fullUrl = `${url}${id}${parameters ? `?${parameters}` : ""}`;

  const response = await axios.get<T>(fullUrl, {
    headers: axiosHeaders as Record<string, string>,
  });

  return response.data;
};
