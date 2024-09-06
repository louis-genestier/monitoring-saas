import { sessionMiddleware } from "@/auth/middleware/sessionMiddleware";
import { prisma } from "@/config/prisma";
import { Context } from "@/types/honoContext";
import {
  NotFoundError,
  ForbiddenError,
  UnauthorizedError,
} from "@/utils/errors";
import { getPaginationParams } from "@/utils/pagination";
import { vValidator } from "@hono/valibot-validator";
import { PriceType } from "@repo/prisma-client";
import { Hono } from "hono";
import { object, string, number, boolean, enum as venum } from "valibot";

const trackedProductSchema = object({
  productId: string(),
  threshold: number(),
  alertProviderId: string(),
  isEnabled: boolean(),
  priceType: venum(PriceType),
});

const app = new Hono<Context>();

const routes = app
  .use("*", sessionMiddleware)
  .get("/", async (c) => {
    const { page, limit, skip } = getPaginationParams(c.req);
    const user = c.get("user");

    if (!user) {
      throw new UnauthorizedError("No user found");
    }

    const userId = user.id;

    const [trackedProducts, total] = await Promise.all([
      prisma.trackedProduct.findMany({
        where: { userId },
        skip,
        take: limit,
        include: {
          product: true,
          alertProvider: true,
        },
      }),
      prisma.trackedProduct.count({ where: { userId } }),
    ]);

    return c.json({
      items: trackedProducts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  })
  .get("/:id", async (c) => {
    const id = c.req.param("id");
    const user = c.get("user");

    if (!user) {
      throw new UnauthorizedError("No user found");
    }

    const userId = user.id;

    const trackedProduct = await prisma.trackedProduct.findUnique({
      where: { id },
      include: {
        product: true,
        alertProvider: true,
      },
    });

    if (!trackedProduct) {
      throw new NotFoundError("Tracked product not found");
    }

    if (trackedProduct.userId !== userId) {
      throw new ForbiddenError(
        "You don't have permission to access this tracked product"
      );
    }

    return c.json(trackedProduct);
  })
  .post("/", vValidator("json", trackedProductSchema), async (c) => {
    const { productId, threshold, alertProviderId, isEnabled, priceType } =
      c.req.valid("json");
    const user = c.get("user");

    if (!user) {
      throw new UnauthorizedError("No user found");
    }

    const userId = user.id;

    const trackedProduct = await prisma.trackedProduct.create({
      data: {
        userId,
        productId,
        threshold,
        alertProviderId,
        isEnabled,
        priceType,
      },
    });

    return c.json(trackedProduct);
  })
  .put("/:id", vValidator("json", trackedProductSchema), async (c) => {
    const id = c.req.param("id");
    const { productId, threshold, alertProviderId, isEnabled, priceType } =
      c.req.valid("json");
    const user = c.get("user");

    if (!user) {
      throw new UnauthorizedError("No user found");
    }

    const userId = user.id;

    const existingTrackedProduct = await prisma.trackedProduct.findUnique({
      where: { id },
    });

    if (!existingTrackedProduct) {
      throw new NotFoundError("Tracked product not found");
    }

    if (existingTrackedProduct.userId !== userId) {
      throw new ForbiddenError(
        "You don't have permission to update this tracked product"
      );
    }

    const updatedTrackedProduct = await prisma.trackedProduct.update({
      where: { id },
      data: {
        productId,
        threshold,
        alertProviderId,
        isEnabled,
        priceType,
      },
    });

    return c.json(updatedTrackedProduct);
  })
  .delete("/:id", async (c) => {
    const id = c.req.param("id");
    const user = c.get("user");

    if (!user) {
      throw new UnauthorizedError("No user found");
    }

    const userId = user.id;

    const existingTrackedProduct = await prisma.trackedProduct.findUnique({
      where: { id },
    });

    if (!existingTrackedProduct) {
      throw new NotFoundError("Tracked product not found");
    }

    if (existingTrackedProduct.userId !== userId) {
      throw new ForbiddenError(
        "You don't have permission to delete this tracked product"
      );
    }

    await prisma.trackedProduct.delete({ where: { id } });

    return c.json({ message: "Tracked product deleted successfully" });
  });

export { routes as trackedProductsRoutes };
