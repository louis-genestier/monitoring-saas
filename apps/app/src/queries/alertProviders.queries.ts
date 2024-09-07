import { AlertProvider } from "@repo/prisma-client";
import { client } from "@repo/front-logic";
import { useQuery } from "@tanstack/react-query";

export const useAlertProviders = () =>
  useQuery<{ items: AlertProvider[] }>({
    queryKey: ["alertProviders"],
    queryFn: () => client["alert-providers"].$get().then((res) => res.json()),
  });
