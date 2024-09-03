import { adminMiddleware } from "@/auth/middleware/isAdminMiddleware";
import { sessionMiddleware } from "@/auth/middleware/sessionMiddleware";
import { prisma } from "@/config/prisma";
import { Context } from "@/types/honoContext";
import { NotFoundError } from "@/utils/errors";
import { getPaginationParams } from "@/utils/pagination";
import { vValidator } from "@hono/valibot-validator";
import { Hono } from "hono";
import { array, object, optional, string } from "valibot";

const productSchema = object({
  name: string(),
  externalIds: optional(
    array(
      object({
        websiteId: string(),
        value: string(),
      })
    )
  ),
});

const app = new Hono<Context>();

const routes = app
  .get("/", sessionMiddleware, adminMiddleware, async (c) => {
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
      items: products,
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
  .post(
    "/",
    sessionMiddleware,
    adminMiddleware,
    vValidator("json", productSchema),
    async (c) => {
      const { name, externalIds } = c.req.valid("json");

      const product = await prisma.product.create({
        data: { name },
      });

      if (externalIds) {
        await prisma.productId.createMany({
          data: externalIds.map((externalId) => ({
            productId: product.id,
            websiteId: externalId.websiteId,
            externalId: externalId.value,
          })),
        });
      }

      return c.json(product);
    }
  )
  .put(
    "/:id",
    sessionMiddleware,
    adminMiddleware,
    vValidator("json", productSchema),
    async (c) => {
      const id = c.req.param("id");
      const { name } = c.req.valid("json");
      const product = await prisma.product.update({
        where: { id },
        data: { name },
      });
      return c.json(product);
    }
  )
  .delete("/:id", sessionMiddleware, adminMiddleware, async (c) => {
    const id = c.req.param("id");
    await prisma.product.delete({
      where: { id },
    });
    return c.json({ message: "Product deleted successfully" });
  });

export { routes as productsRoutes };
