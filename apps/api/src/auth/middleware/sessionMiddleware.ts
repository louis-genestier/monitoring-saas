import { lucia } from "@/config/lucia";
import { UnauthorizedError } from "@/utils/errors";
import { MiddlewareHandler } from "hono";

export const sessionMiddleware: MiddlewareHandler = async (c, next) => {
  const sessionId = lucia.readSessionCookie(c.req.header("Cookie") ?? "");

  if (!sessionId) {
    c.set("user", null);
    c.set("session", null);
    throw new UnauthorizedError("No session found");
  }

  const { session, user } = await lucia.validateSession(sessionId);

  if (session && session.fresh) {
    c.header("Set-Cookie", lucia.createSessionCookie(session.id).serialize(), {
      append: true,
    });
  }

  if (!session) {
    c.header("Set-Cookie", lucia.createBlankSessionCookie().serialize(), {
      append: true,
    });

    throw new UnauthorizedError("No session found");
  }

  c.set("session", session);
  c.set("user", user);
  return next();
};
