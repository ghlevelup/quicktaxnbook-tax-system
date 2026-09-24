/*
  Warnings:

  - A unique constraint covering the columns `[ghlLocationId]` on the table `Firm` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "IntegrationProvider" ADD VALUE 'GOHIGHLEVEL';

-- AlterTable
ALTER TABLE "Firm" ADD COLUMN     "ghlCompanyId" TEXT,
ADD COLUMN     "ghlConnectedAt" TIMESTAMP(3),
ADD COLUMN     "ghlLocationId" TEXT;

-- AlterTable
ALTER TABLE "Integration" ADD COLUMN     "lastVerifiedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "GhlAgencyConnection" (
    "id" TEXT NOT NULL,
    "companyId" TEXT,
    "companyName" TEXT,
    "relationshipNumber" TEXT,
    "tokenEncrypted" TEXT NOT NULL,
    "status" "IntegrationStatus" NOT NULL DEFAULT 'CONNECTED',
    "lastVerifiedAt" TIMESTAMP(3),
    "lastError" TEXT,
    "connectedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GhlAgencyConnection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GhlAgencyConnection_companyId_key" ON "GhlAgencyConnection"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Firm_ghlLocationId_key" ON "Firm"("ghlLocationId");

-- AddForeignKey
ALTER TABLE "GhlAgencyConnection" ADD CONSTRAINT "GhlAgencyConnection_connectedById_fkey" FOREIGN KEY ("connectedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
