/*
  Warnings:

  - Made the column `baseUrl` on table `Website` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Website" ALTER COLUMN "baseUrl" SET NOT NULL;
