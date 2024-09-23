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

    const products = await prisma.product.findMany({
      // skip,
      // take: limit,
      include: {
        ProductId: {
          include: {
            website: true,
          },
        },
      },
    });
    // const [products, total] = await Promise.all([
    //   prisma.product.count(),
    // ]);

    return c.json({
      items: products,
      // pagination: {
      //   page,
      //   limit,
      //   total,
      //   totalPages: Math.ceil(total / limit),
      // },
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
      const { name, externalIds } = c.req.valid("json");

      const externalIdsFromRequest = externalIds?.map((externalId) => ({
        productId: id,
        websiteId: externalId.websiteId,
        externalId: externalId.value,
      }));

      const productIds = await prisma.productId.findMany({
        where: { productId: id },
      });

      const productIdsToDelete = productIds.filter((productId) => {
        return !externalIdsFromRequest?.some((externalId) => {
          return productId.websiteId === externalId.websiteId;
        });
      });

      const productIdsToCreate = externalIdsFromRequest?.filter(
        (externalId) => {
          return !productIds.some((productId) => {
            return productId.websiteId === externalId.websiteId;
          });
        }
      );

      // const productIdsToUpdate = externalIdsFromRequest?.filter(
      //   (externalId) => {
      //     return productIds.some((productId) => {
      //       return productId.websiteId === externalId.websiteId;
      //     });
      //   }
      // );

      await prisma.productId.deleteMany({
        where: {
          productId: id,
          websiteId: { in: productIdsToDelete.map((p) => p.websiteId) },
        },
      });

      // if (productIdsToUpdate) {
      //   await Promise.all(
      //     productIdsToUpdate.map((productId) => {
      //       return prisma.productId.update({
      //         where: {
      //           productId_websiteId: {
      //             productId: productId.productId,
      //             websiteId: productId.websiteId,
      //           },
      //         },
      //         data: {
      //           externalId: productId.externalId,
      //         },
      //       });
      //     })
      //   );
      // }

      if (productIdsToCreate) {
        await prisma.productId.createMany({
          data: productIdsToCreate,
        });
      }

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
  })
  .get("/:id/price-points", sessionMiddleware, adminMiddleware, async (c) => {
    const id = c.req.param("id");

    const pricePoints = await prisma.pricePoint.findMany({
      where: {
        productId: id,
        timestamp: {
          gte: new Date(new Date().setDate(new Date().getDate() - 1)),
        },
      },
      orderBy: {
        timestamp: "desc",
      },
      include: {
        website: true,
      },
    });

    return c.json(pricePoints);
  });

export { routes as productsRoutes };
