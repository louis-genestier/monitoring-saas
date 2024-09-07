import { Prisma, PrismaClient } from "./generated/client";

export const prisma = new PrismaClient();
export * from "./generated/client";

export type TrackedProductWithAlert = Prisma.TrackedProductGetPayload<{
  include: { Alert: true };
}>;

export type TrackedProductWithAllRelations = Prisma.TrackedProductGetPayload<{
  include: { product: true; Alert: true; alertProvider: true };
}>;
