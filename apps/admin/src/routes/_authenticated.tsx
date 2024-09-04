import { createFileRoute, redirect } from "@tanstack/react-router";
import { useAuthStore } from "../store/authStore";
import { client } from "@repo/front-logic";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async () => {
    const response = await client.auth.me.$get();
    const user = await response.json();

    if (!response.ok || !user.isAdmin) {
      useAuthStore.getState().logout();
      throw redirect({
        to: "/login",
      });
    }

    useAuthStore.getState().setUser(user);
  },
  loader: () => {
    const user = useAuthStore.getState().user;

    if (!user) {
      throw redirect({
        to: "/login",
      });
    }

    return user;
  },
});
