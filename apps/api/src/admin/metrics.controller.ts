import { adminMiddleware } from "@/auth/middleware/isAdminMiddleware";
import { sessionMiddleware } from "@/auth/middleware/sessionMiddleware";
import { prisma } from "@/config/prisma";
import { Context } from "@/types/honoContext";
import { Hono } from "hono";

const app = new Hono<Context>();

const routes = app
  .get("/users", sessionMiddleware, adminMiddleware, async (c) => {
    const totalUsers = await prisma.user.count();
    const newUsersLast30Days = await prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    });
    return c.json({ totalUsers, newUsersLast30Days });
  })
  .get("/revenue", sessionMiddleware, adminMiddleware, async (c) => {
    const subscriptions = await prisma.subscription.findMany({
      where: {
        status: "active",
      },
      select: {
        planName: true,
      },
    });

    const revenue = subscriptions.reduce((total, sub) => {
      switch (sub.planName) {
        case "basic":
          return total + 10;
        case "standard":
          return total + 20;
        case "premium":
          return total + 30;
        default:
          return total;
      }
    }, 0);

    return c.json({ monthlyRecurringRevenue: revenue });
  });

export { routes as metricsRoutes };
