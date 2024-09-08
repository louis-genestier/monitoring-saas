import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useAuthStore } from "../store/authStore";
import { client } from "@repo/front-logic";
import { Navbar } from "../components/navbar";

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
  component: () => {
    return (
      <div className="w-screen">
        <Navbar />
        <div className="xl:ml-64">
          <Outlet />
        </div>
      </div>
    );
  },
});
