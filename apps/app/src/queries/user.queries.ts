import { client } from "@repo/front-logic";
import { useQuery } from "@tanstack/react-query";

export const useProfile = () =>
  useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await client.user.profile.$get();

      return await res.json();
    },
  });
