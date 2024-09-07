import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@repo/front-logic";
import { TrackedProductWithAllRelations, PriceType } from "@repo/prisma-client";

type TrackedProductInput = {
  productId: string;
  threshold: number;
  alertProviderId: string;
  isEnabled: boolean;
  priceType: PriceType;
};

type PaginationParams = {
  page: number;
  limit: number;
};

type PaginationResponse = PaginationParams & {
  total: number;
  totalPages: number;
};

export const useTrackedProducts = (pagination: PaginationParams) => {
  return useQuery<{
    items: TrackedProductWithAllRelations[];
    pagination: PaginationResponse;
  }>({
    queryKey: ["trackedProducts", pagination],
    queryFn: () =>
      client["tracked-products"]
        .$get({
          query: {
            page: pagination.page,
            limit: pagination.limit,
          },
        })
        .then((res) => res.json()),
  });
};

export const useTrackedProduct = (id: string) => {
  return useQuery<TrackedProductWithAllRelations>({
    queryKey: ["trackedProducts", id],
    queryFn: () =>
      client["tracked-products"][":id"]
        .$get({ param: { id } })
        .then((res) => res.json()),
  });
};

export const useCreateTrackedProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TrackedProductInput) =>
      client["tracked-products"].$post({ json: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trackedProducts"] });
    },
  });
};

export const useUpdateTrackedProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: TrackedProductInput & { id: string }) =>
      client["tracked-products"][":id"].$put({ param: { id }, json: data }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["trackedProducts"] });
      queryClient.invalidateQueries({
        queryKey: ["trackedProducts", variables.id],
      });
    },
  });
};

export const useDeleteTrackedProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      client["tracked-products"][":id"].$delete({ param: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trackedProducts"] });
    },
  });
};
