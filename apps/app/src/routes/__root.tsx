import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";

export const Route = createRootRoute({
  component: () => (
    <div className="bg-gradient-to-br from-purple-100 via-blue-100 to-green-100 min-h-screen absolute">
      <Outlet />
      {/* TODO: remove this in production */}
      <TanStackRouterDevtools />
    </div>
  ),
});
