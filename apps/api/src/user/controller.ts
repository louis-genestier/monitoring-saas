import { sessionMiddleware } from "@/auth/middleware/sessionMiddleware";
import { Context } from "@/types/honoContext";
import { NotFoundError, UnauthorizedError } from "@/utils/errors";
import { prisma } from "@repo/prisma-client";
import { Hono } from "hono";

const app = new Hono<Context>();

const routes = app.get("/profile", sessionMiddleware, async (c) => {
  const user = c.get("user");

  if (!user) {
    throw new UnauthorizedError("No user found");
  }

  const userProfile = await prisma.user.findUnique({
    where: {
      id: user.id,
    },
    include: {
      subscription: true,
    },
  });

  if (!userProfile) {
    throw new NotFoundError("User not found");
  }

  return c.json({
    id: userProfile.id,
    email: userProfile.email,
    isAdmin: userProfile.isAdmin,
    subscription: userProfile.subscription,
  });
});

export { routes as userRoutes };
