import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import { Lucia } from "lucia";
import { prisma } from "./prisma";
import { NODE_ENV, FRONTEND_URL } from "./env";
import { User } from "@repo/prisma-client";

export const lucia = new Lucia(new PrismaAdapter(prisma.session, prisma.user), {
  sessionCookie: {
    attributes: {
      secure: NODE_ENV === "production",
      // TODO: Change this to frontend domain
      domain: NODE_ENV === "production" ? FRONTEND_URL : undefined,
      path: "/",
    },
  },
  getUserAttributes: (attributes) => ({
    email: attributes.email,
    isAdmin: attributes.isAdmin,
  }),
});

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: Omit<User, "id">;
  }
}
