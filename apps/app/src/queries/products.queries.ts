import { useQuery } from "@tanstack/react-query";
import { client } from "@repo/front-logic";
import { Product } from "@repo/prisma-client";

type PaginationParams = {
  page: number;
  limit: number;
};

type PaginationResponse = PaginationParams & {
  total: number;
  totalPages: number;
};

export const useProducts = (pagination: PaginationParams) => {
  return useQuery<{
    items: Product[];
    pagination: PaginationResponse;
  }>({
    queryKey: ["products", pagination],
    queryFn: () =>
      client.products
        .$get({
          query: {
            page: pagination.page,
            limit: pagination.limit,
          },
        })
        .then((res) => res.json()),
  });
};
