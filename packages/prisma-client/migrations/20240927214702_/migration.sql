/*
  Warnings:

  - Added the required column `alertProviderId` to the `Alert` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Alert" ADD COLUMN     "alertProviderId" TEXT NOT NULL;
