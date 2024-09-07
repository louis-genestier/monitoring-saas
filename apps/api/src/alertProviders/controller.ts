import { sessionMiddleware } from "@/auth/middleware/sessionMiddleware";
import { prisma } from "@/config/prisma";
import { Context } from "@/types/honoContext";
import { Hono } from "hono";

const app = new Hono<Context>();

const routes = app.use("*", sessionMiddleware).get("/", async (c) => {
  const alertProviders = await prisma.alertProvider.findMany({
    select: {
      id: true,
      name: true,
    },
  });

  return c.json({
    items: alertProviders,
  });
});

export { routes as alertProviderRoutes };
