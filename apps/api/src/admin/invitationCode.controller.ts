import { adminMiddleware } from "@/auth/middleware/isAdminMiddleware";
import { sessionMiddleware } from "@/auth/middleware/sessionMiddleware";
import { Context } from "@/types/honoContext";
import { prisma } from "@repo/prisma-client";
import { randomBytes } from "crypto";
import { Hono } from "hono";

const app = new Hono<Context>();

const routes = app
  .post("/", sessionMiddleware, adminMiddleware, async (c) => {
    const invitationCode = await prisma.invitationCode.create({
      data: {
        code: randomBytes(20).toString("hex"),
      },
    });

    return c.json(invitationCode);
  })
  .get("/", sessionMiddleware, adminMiddleware, async (c) => {
    const codes = await prisma.invitationCode.findMany({
      include: {
        user: true,
      },
    });

    return c.json(codes);
  })
  .delete("/:id", sessionMiddleware, adminMiddleware, async (c) => {
    const id = c.req.param("id");
    await prisma.invitationCode.delete({
      where: {
        id: id,
      },
    });

    return c.json({ message: "Invitation code deleted" });
  });

export { routes as invitationCodeRoutes };
