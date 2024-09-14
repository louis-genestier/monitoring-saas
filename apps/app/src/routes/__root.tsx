import { createRootRoute, Outlet } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: () => (
    <div className="bg-gradient-to-br from-purple-100 via-blue-100 to-green-100 min-h-screen absolute">
      <Outlet />
    </div>
  ),
});
