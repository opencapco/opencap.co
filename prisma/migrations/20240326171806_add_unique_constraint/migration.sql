/*
  Warnings:

  - A unique constraint covering the columns `[templateId,email,group]` on the table `EsignRecipient` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "EsignRecipient_templateId_email_group_key" ON "EsignRecipient"("templateId", "email", "group");
