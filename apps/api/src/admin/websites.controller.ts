import { adminMiddleware } from "@/auth/middleware/isAdminMiddleware";
import { sessionMiddleware } from "@/auth/middleware/sessionMiddleware";
import { prisma } from "@/config/prisma";
import { Context } from "@/types/honoContext";
import { getPaginationParams } from "@/utils/pagination";
import { vValidator } from "@hono/valibot-validator";
import { Hono } from "hono";
import { StatusCode } from "hono/utils/http-status";
import { boolean, object, optional, pipe, string, url } from "valibot";

const websiteSchema = object({
  name: string(),
  apiBaseurl: string(),
  headers: string(),
  isEnabled: boolean(),
  parameters: optional(string()),
  baseUrl: pipe(string(), url()),
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
      const { name, apiBaseurl, headers, isEnabled, parameters, baseUrl } =
        c.req.valid("json");

      let parsedHeaders;

      try {
        // If headers is already an object, use it as is
        // If it's a string, attempt to parse it
        parsedHeaders =
          typeof headers === "object" ? headers : JSON.parse(headers);
      } catch (error) {
        return c.json({ error: "Invalid JSON in headers" }, 400);
      }

      if (typeof parsedHeaders !== "object" || parsedHeaders === null) {
        return c.json({ error: "Headers must be a valid JSON object" }, 400);
      }

      const website = await prisma.website.create({
        data: {
          apiBaseurl,
          name,
          headers: parsedHeaders,
          isEnabled,
          parameters,
          baseUrl,
        },
      });

      return c.json({
        ...website,
        headers: JSON.stringify(website.headers),
      });
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
  })
  .get("/:id/test", sessionMiddleware, adminMiddleware, async (c) => {
    const id = c.req.param("id");
    const website = await prisma.website.findUnique({
      where: { id },
    });

    const productId = await prisma.productId.findFirst({
      where: {
        websiteId: website?.id,
      },
    });

    if (!productId) {
      return c.json({ error: "No product attached to this website" }, 404);
    }

    if (!website) {
      return c.json({ error: "Website not found" }, 404);
    }

    try {
      const response = await fetch(
        `${website?.apiBaseurl}${productId?.externalId}${website?.parameters ? `?${website?.parameters}` : ""}`,
        {
          headers: website?.headers as HeadersInit,
        }
      );

      if (!response.ok) {
        return c.json(
          { error: "Failed to fetch product" },
          response.status as StatusCode
        );
      }

      const data = await response.json();
      return c.json({ data });
    } catch (error) {
      return c.json({ error: "Failed to fetch product" }, 500);
    }
  });

export { routes as websitesRoutes };
