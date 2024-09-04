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
      items: users,
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
    const user = await prisma.user.findUnique({
      where: { id },
      include: { subscription: true },
    });
    if (!user) {
      throw new NotFoundError("User not found");
    }
    return c.json(user);
  })
  .put("/:id", sessionMiddleware, adminMiddleware, async (c) => {
    const id = c.req.param("id");
    const { isAdmin } = await c.req.json();
    const user = await prisma.user.update({
      where: { id },
      data: { isAdmin },
    });
    return c.json(user);
  });

export { routes as userRoutes };
