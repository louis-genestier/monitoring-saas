import { Context } from "@/types/honoContext";
import { ForbiddenError } from "@/utils/errors";
import { MiddlewareHandler } from "hono";

export const adminMiddleware: MiddlewareHandler<Context> = async (c, next) => {
  const user = c.get("user");

  if (!user) {
    throw new ForbiddenError("Authentication required");
  }

  if (!user.isAdmin) {
    throw new ForbiddenError("Admin access required");
  }

  await next();
};
