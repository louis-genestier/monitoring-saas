/*
  Warnings:

  - A unique constraint covering the columns `[externalId]` on the table `ExternalProduct` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ExternalProduct_externalId_key" ON "ExternalProduct"("externalId");
