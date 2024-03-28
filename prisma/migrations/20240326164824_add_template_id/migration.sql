/*
  Warnings:

  - Added the required column `templateId` to the `EsignRecipient` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "EsignRecipient" ADD COLUMN     "templateId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "EsignRecipient_templateId_idx" ON "EsignRecipient"("templateId");
