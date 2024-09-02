import { adminMiddleware } from "@/auth/middleware/isAdminMiddleware";
import { sessionMiddleware } from "@/auth/middleware/sessionMiddleware";
import { prisma } from "@/config/prisma";
import { Context } from "@/types/honoContext";
import { NotFoundError } from "@/utils/errors";
import { Hono, HonoRequest } from "hono";

const app = new Hono<Context>().use("*", sessionMiddleware, adminMiddleware);

const getPaginationParams = (req: HonoRequest) => {
  const page = parseInt(req.query("page") || "1");
  const limit = parseInt(req.query("limit") || "10");
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

const routes = app
  .get("/users", async (c) => {
    const { page, limit, skip } = getPaginationParams(c.req);

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          email: true,
          isAdmin: true,
          createdAt: true,
          subscription: {
            select: {
              status: true,
              planName: true,
            },
          },
        },
        skip,
        take: limit,
      }),
      prisma.user.count(),
    ]);

    return c.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  })
  .get("/users/:id", async (c) => {
    const id = c.req.param("id");
    const user = await prisma.user.findUnique({
      where: { id },
      include: { subscription: true },
    });
    if (!user) {
      throw new NotFoundError("User not found");
    }
    return c.json(user);
  })
  .put("/users/:id", async (c) => {
    const id = c.req.param("id");
    const { isAdmin } = await c.req.json();
    const user = await prisma.user.update({
      where: { id },
      data: { isAdmin },
    });
    return c.json(user);
  });

// Subscription Management
app
  .get("/subscriptions", async (c) => {
    const { page, limit, skip } = getPaginationParams(c.req);

    const [subscriptions, total] = await Promise.all([
      prisma.subscription.findMany({
        include: { user: { select: { email: true } } },
        skip,
        take: limit,
      }),
      prisma.subscription.count(),
    ]);

    return c.json({
      subscriptions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  })
  .get("/subscriptions/:id", async (c) => {
    const id = c.req.param("id");
    const subscription = await prisma.subscription.findUnique({
      where: { id },
      include: { user: { select: { email: true } } },
    });
    if (!subscription) {
      throw new NotFoundError("Subscription not found");
    }
    return c.json(subscription);
  })
  .put("/subscriptions/:id", async (c) => {
    const id = c.req.param("id");
    const { status, planName } = await c.req.json();
    const subscription = await prisma.subscription.update({
      where: { id },
      data: { status, planName },
    });
    return c.json(subscription);
  })
  .get("/metrics/users", async (c) => {
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
  .get("/metrics/revenue", async (c) => {
    const subscriptions = await prisma.subscription.findMany({
      where: {
        status: "active",
      },
      select: {
        planName: true,
      },
    });

    // This is a simplified revenue calculation. In a real-world scenario,
    // you'd need to consider things like different pricing tiers, discounts, etc.
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

export { routes as adminRoutes };
