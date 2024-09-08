import { sessionMiddleware } from "@/auth/middleware/sessionMiddleware";
import { prisma } from "@/config/prisma";
import { Context } from "@/types/honoContext";
import { NotFoundError, UnauthorizedError } from "@/utils/errors";
import { getPaginationParams } from "@/utils/pagination";
import { rateLimiterInstance } from "@/utils/rateLimit";
import { Hono } from "hono";

const app = new Hono<Context>();

const routes = app
  .use("*", sessionMiddleware)
  .get("/", rateLimiterInstance(30, 1), async (c) => {
    const { page, limit, skip } = getPaginationParams(c.req);
    const user = c.get("user");

    if (!user) {
      throw new UnauthorizedError("No user found");
    }

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
      items: products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  })
  .get("/:id", rateLimiterInstance(10, 1), async (c) => {
    const id = c.req.param("id");
    const user = c.get("user");

    if (!user) {
      throw new UnauthorizedError("No user found");
    }

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
  });

export { routes as productsRoutes };
