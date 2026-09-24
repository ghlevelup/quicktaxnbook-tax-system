/*
  Warnings:

  - Added the required column `clientId` to the `DocumentRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "StorageProvider" ADD VALUE 'GHL_MEDIA';

-- DropForeignKey
ALTER TABLE "DocumentRequest" DROP CONSTRAINT "DocumentRequest_caseId_fkey";

-- AlterTable
ALTER TABLE "DocumentRequest" ADD COLUMN     "clientId" TEXT NOT NULL,
ALTER COLUMN "caseId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "StoredFile" ADD COLUMN     "externalFileId" TEXT;

-- CreateIndex
CREATE INDEX "DocumentRequest_clientId_status_idx" ON "DocumentRequest"("clientId", "status");

-- AddForeignKey
ALTER TABLE "DocumentRequest" ADD CONSTRAINT "DocumentRequest_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentRequest" ADD CONSTRAINT "DocumentRequest_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
