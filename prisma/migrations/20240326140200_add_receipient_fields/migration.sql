/*
  Warnings:

  - Added the required column `group` to the `EsignRecipient` table without a default value. This is not possible if the table is not empty.
  - Made the column `email` on table `EsignRecipient` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "EsignRecipient" ADD COLUMN     "group" TEXT NOT NULL,
ADD COLUMN     "name" TEXT,
ALTER COLUMN "email" SET NOT NULL;
