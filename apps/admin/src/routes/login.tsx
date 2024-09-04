import { createFileRoute, redirect } from "@tanstack/react-router";
import { LoginPage } from "../pages/Login";
import { useAuthStore } from "../store/authStore";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  beforeLoad: async () => {
    if (useAuthStore.getState().user && useAuthStore.getState().user?.isAdmin) {
      throw redirect({
        to: "/",
      });
    }
  },
});
