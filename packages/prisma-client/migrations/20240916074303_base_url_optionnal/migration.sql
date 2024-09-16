/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Website` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Website" ADD COLUMN     "baseUrl" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Website_name_key" ON "Website"("name");
