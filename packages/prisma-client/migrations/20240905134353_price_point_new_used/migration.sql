/*
  Warnings:

  - Added the required column `priceType` to the `TrackedProduct` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PriceType" AS ENUM ('NEW', 'USED');

-- AlterTable
ALTER TABLE "PricePoint" ADD COLUMN     "priceType" "PriceType" NOT NULL DEFAULT 'NEW';

-- AlterTable
ALTER TABLE "TrackedProduct" ADD COLUMN     "priceType" "PriceType" NOT NULL;
