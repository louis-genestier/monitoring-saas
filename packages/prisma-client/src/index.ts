import { Prisma, PrismaClient } from "./generated/client";

export const prisma = new PrismaClient();
export * from "./generated/client";

export type ExternalProductWithAllRelations = Prisma.ExternalProductGetPayload<{
  include: {
    product: true;
    website: true;
  };
}>;

export type AlertWithPricepoint = Prisma.AlertGetPayload<{
  include: {
    pricePoint: true;
  };
}>;

export type ProductWithPricepoint = Prisma.ProductGetPayload<{
  include: {
    PricePoint: true;
  };
}>;
