import { adminMiddleware } from "@/auth/middleware/isAdminMiddleware";
import { sessionMiddleware } from "@/auth/middleware/sessionMiddleware";
import { lucia } from "@/config/lucia";
import { prisma } from "@/config/prisma";
import { Context } from "@/types/honoContext";
import {
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from "@/utils/errors";
import { getPaginationParams } from "@/utils/pagination";
import { vValidator } from "@hono/valibot-validator";
import { verify } from "@/auth/service/bcrypt";
import { Hono } from "hono";
import { object, string } from "valibot";
import { productsRoutes } from "./products.controller";
import { websitesRoutes } from "./websites.controller";
import { userRoutes } from "./user.controller";
import { subscriptionRoutes } from "./subscription.controller";
import { metricsRoutes } from "./metrics.controller";
import { invitationCodeRoutes } from "./invitationCode.controller";

const app = new Hono<Context>();

const loginSchema = object({
  email: string(),
  password: string(),
});

const routes = app
  .post("/login", vValidator("json", loginSchema), async (c) => {
    const { email, password } = c.req.valid("json");
    const user = await prisma.user.findUnique({
      where: { email, isAdmin: true },
    });

    const passwordHash = user?.password ?? "$2a$12$" + "a".repeat(53);
    const isValidPassword = await verify(password, passwordHash);

    if (isValidPassword && user) {
      if (!user.isEmailVerified) {
        throw new ForbiddenError("Email is not verified");
      }
      const session = await lucia.createSession(user.id, {});
      c.header(
        "Set-Cookie",
        lucia.createSessionCookie(session.id).serialize(),
        {
          append: true,
        }
      );

      return c.json({ message: "Logged in successfully" });
    } else {
      throw new UnauthorizedError("Invalid email or password");
    }
  })
  .route("/users", userRoutes)
  .route("/subscriptions", subscriptionRoutes)
  .route("/metrics", metricsRoutes)
  .route("/products", productsRoutes)
  .route("/websites", websitesRoutes)
  .route("/invitations", invitationCodeRoutes);

export { routes as adminRoutes };
