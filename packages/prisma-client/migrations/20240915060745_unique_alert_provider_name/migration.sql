/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `AlertProvider` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "AlertProvider_name_key" ON "AlertProvider"("name");
