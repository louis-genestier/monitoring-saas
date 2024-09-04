import { adminMiddleware } from "@/auth/middleware/isAdminMiddleware";
import { sessionMiddleware } from "@/auth/middleware/sessionMiddleware";
import { prisma } from "@/config/prisma";
import { Context } from "@/types/honoContext";
import { NotFoundError } from "@/utils/errors";
import { getPaginationParams } from "@/utils/pagination";
import { Hono } from "hono";

const app = new Hono<Context>();

const routes = app
  .get("/", sessionMiddleware, adminMiddleware, async (c) => {
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
      items: subscriptions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  })
  .get("/:id", sessionMiddleware, adminMiddleware, async (c) => {
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
  .put("/:id", sessionMiddleware, adminMiddleware, async (c) => {
    const id = c.req.param("id");
    const { status, planName } = await c.req.json();
    const subscription = await prisma.subscription.update({
      where: { id },
      data: { status, planName },
    });
    return c.json(subscription);
  });

export { routes as subscriptionRoutes };
