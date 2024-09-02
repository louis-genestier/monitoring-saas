import { createFileRoute, redirect } from "@tanstack/react-router";
import { AppType } from "api";
import { hc } from "hono/client";
import { useAuthStore } from "../store/authStore";

const client = hc<AppType>("/api");

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async () => {
    const response = await client.auth.me.$get();

    if (!response.ok) {
      useAuthStore.getState().logout();
      throw redirect({
        to: "/login",
      });
    }

    const user = await response.json();

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
