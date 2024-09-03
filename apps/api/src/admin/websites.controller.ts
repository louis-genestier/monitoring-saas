import { adminMiddleware } from "@/auth/middleware/isAdminMiddleware";
import { sessionMiddleware } from "@/auth/middleware/sessionMiddleware";
import { prisma } from "@/config/prisma";
import { Context } from "@/types/honoContext";
import { getPaginationParams } from "@/utils/pagination";
import { vValidator } from "@hono/valibot-validator";
import { Hono } from "hono";
import { object, string } from "valibot";

const websiteSchema = object({
  name: string(),
  apiBaseurl: string(),
  headers: string(),
});

const app = new Hono<Context>();

const routes = app
  .get("/", sessionMiddleware, adminMiddleware, async (c) => {
    const { page, limit, skip } = getPaginationParams(c.req);
    const websites = await prisma.website.findMany({
      skip,
      take: limit,
    });
    const total = await prisma.website.count();
    return c.json({
      items: websites.map((website) => ({
        ...website,
        headers: JSON.stringify(website?.headers),
      })),
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
    const website = await prisma.website.findUnique({
      where: { id },
    });
    return c.json({ ...website, headers: JSON.stringify(website?.headers) });
  })
  .post(
    "/",
    sessionMiddleware,
    adminMiddleware,
    vValidator("json", websiteSchema),
    async (c) => {
      const { name, apiBaseurl, headers } = c.req.valid("json");
      const website = await prisma.website.create({
        data: {
          apiBaseurl,
          name,
          headers: JSON.parse(headers),
        },
      });
      return c.json(website);
    }
  )
  .put(
    "/:id",
    sessionMiddleware,
    adminMiddleware,
    vValidator("json", websiteSchema),
    async (c) => {
      const id = c.req.param("id");
      const data = c.req.valid("json");

      const website = await prisma.website.update({
        where: { id },
        data: {
          ...data,
          headers: JSON.parse(data.headers),
        },
      });
      return c.json({ ...website, headers: JSON.stringify(website?.headers) });
    }
  )
  .delete("/:id", sessionMiddleware, adminMiddleware, async (c) => {
    const id = c.req.param("id");
    await prisma.website.delete({
      where: { id },
    });
    return c.json({ message: "Website deleted successfully" });
  });

export { routes as websitesRoutes };
