import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { authRoutes } from "./auth/controller";
import { PORT, NODE_ENV } from "./config/env";
import { AppError } from "./utils/errors";
import { stripeRoutes } from "./stripe/controller";
import { adminRoutes } from "./admin/controller";
import { trackedProductsRoutes } from "./trackedProducts/controller";
import { cors } from "hono/cors";
import { productsRoutes } from "./products/controller";
import { alertProviderRoutes } from "./alertProviders/controller";
import { userRoutes } from "./user/controller";

const app = new Hono();

// TODO: handle CORS properly!
app.use(
  "*",
  cors({
    credentials: true,
    origin: "*",
  })
);

const routes = app
  .route("/auth", authRoutes)
  .route("/stripe", stripeRoutes)
  .route("/admin", adminRoutes)
  .route("/tracked-products", trackedProductsRoutes)
  .route("/products", productsRoutes)
  .route("/alert-providers", alertProviderRoutes)
  .route("/user", userRoutes)
  .get("/health", (c) => {
    return c.json({ status: "ok" });
  })
  .onError((error, c) => {
    console.error(error);

    if (error instanceof AppError) {
      return c.json({ error: error.message }, error.statusCode);
    }

    return c.json({ error: "Internal server error" }, 500);
  });

console.log(`Server is running on port ${PORT} in ${NODE_ENV} mode`);

serve({
  fetch: app.fetch,
  port: PORT,
});

export type AppType = typeof routes;
