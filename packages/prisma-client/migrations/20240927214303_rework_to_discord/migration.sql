-- Rename ProductId table to ExternalProduct
ALTER TABLE "ProductId" RENAME TO "ExternalProduct";

-- Rename the primary key constraint
ALTER INDEX "ProductId_pkey" RENAME TO "ExternalProduct_pkey";

-- Rename the unique constraint
ALTER INDEX "ProductId_productId_websiteId_key" RENAME TO "ExternalProduct_productId_websiteId_key";

-- Update foreign key constraints
ALTER TABLE "ExternalProduct" RENAME CONSTRAINT "ProductId_productId_fkey" TO "ExternalProduct_productId_fkey";
ALTER TABLE "ExternalProduct" RENAME CONSTRAINT "ProductId_websiteId_fkey" TO "ExternalProduct_websiteId_fkey";

-- Modify Alert table
ALTER TABLE "Alert" DROP COLUMN "trackedProductId";
ALTER TABLE "Alert" DROP COLUMN "alertProviderId";
ALTER TABLE "Alert" ADD COLUMN "discount" DOUBLE PRECISION NOT NULL;
ALTER TABLE "Alert" ADD COLUMN "externalProductId" TEXT NOT NULL;

-- Add foreign key for Alert to ExternalProduct
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_externalProductId_fkey" FOREIGN KEY ("externalProductId") REFERENCES "ExternalProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Modify Product table
ALTER TABLE "Product" ADD COLUMN "averagePrice" DOUBLE PRECISION;
ALTER TABLE "Product" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Drop unused tables
DROP TABLE IF EXISTS "TrackedProduct";
DROP TABLE IF EXISTS "AlertProvider";