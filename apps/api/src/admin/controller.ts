import { adminMiddleware } from "@/auth/middleware/isAdminMiddleware";
import { sessionMiddleware } from "@/auth/middleware/sessionMiddleware";
import { prisma } from "@/config/prisma";
import { Context } from "@/types/honoContext";
import { NotFoundError } from "@/utils/errors";
import { vValidator } from "@hono/valibot-validator";
import { Hono, HonoRequest } from "hono";
import { object, string } from "valibot";

const app = new Hono<Context>().use("*", sessionMiddleware, adminMiddleware);

const websiteSchema = object({
  name: string(),
  apiBaseurl: string(),
  headers: string(),
});

const productSchema = object({
  name: string(),
});

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
  })
  // Subscriptions management
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
  })
  // Website management
  .get("/websites", async (c) => {
    const websites = await prisma.website.findMany();
    return c.json(websites);
  })
  .post("/websites", vValidator("json", websiteSchema), async (c) => {
    const { name, apiBaseurl, headers } = c.req.valid("json");
    const website = await prisma.website.create({
      data: {
        apiBaseurl,
        name,
        headers: JSON.parse(headers),
      },
    });
    return c.json(website);
  })
  .put("/websites/:id", vValidator("json", websiteSchema), async (c) => {
    const id = c.req.param("id");
    const { name, apiBaseurl, headers } = c.req.valid("json");
    const website = await prisma.website.update({
      where: { id },
      data: { name, apiBaseurl, headers: JSON.parse(headers) },
    });
    return c.json(website);
  })
  .delete("/websites/:id", async (c) => {
    const id = c.req.param("id");
    await prisma.website.delete({
      where: { id },
    });
    return c.json({ message: "Website deleted successfully" });
  })
  // Product management
  .get("/products", async (c) => {
    const { page, limit, skip } = getPaginationParams(c.req);

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        skip,
        take: limit,
        include: {
          ProductId: {
            include: {
              website: true,
            },
          },
        },
      }),
      prisma.product.count(),
    ]);

    return c.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  })
  .get("/products/:id", async (c) => {
    const id = c.req.param("id");
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        ProductId: {
          include: {
            website: true,
          },
        },
        PricePoint: {
          orderBy: {
            timestamp: "desc",
          },
          take: 10,
        },
      },
    });
    if (!product) {
      throw new NotFoundError("Product not found");
    }
    return c.json(product);
  })
  .post("/products", vValidator("json", productSchema), async (c) => {
    const { name } = c.req.valid("json");
    const product = await prisma.product.create({
      data: { name },
    });
    return c.json(product);
  })
  .put("/products/:id", vValidator("json", productSchema), async (c) => {
    const id = c.req.param("id");
    const { name } = c.req.valid("json");
    const product = await prisma.product.update({
      where: { id },
      data: { name },
    });
    return c.json(product);
  })
  .delete("/products/:id", async (c) => {
    const id = c.req.param("id");
    await prisma.product.delete({
      where: { id },
    });
    return c.json({ message: "Product deleted successfully" });
  });

export { routes as adminRoutes };
