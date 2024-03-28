/*
  Warnings:

  - Made the column `group` on table `TemplateField` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "TemplateField" ADD COLUMN     "prefilledValue" TEXT,
ALTER COLUMN "group" SET NOT NULL;
