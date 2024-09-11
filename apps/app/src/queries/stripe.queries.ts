import { client } from "@repo/front-logic";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useCreateCheckoutSession = () =>
  useMutation({
    mutationFn: async (priceId: string) => {
      const res = await client.stripe["create-checkout-session"].$post({
        json: { priceId },
      });

      return await res.json();
    },
    onSuccess: ({ url }) => {
      window.location.href = url;
    },
  });

export const useCheckoutSession = (sessionId: string) =>
  useQuery({
    queryKey: ["checkout-session", sessionId],
    queryFn: async () => {
      const res = await client.stripe["checkout-session"][":sessionId"].$get({
        param: { sessionId },
      });

      return await res.json();
    },
    enabled: !!sessionId,
  });
