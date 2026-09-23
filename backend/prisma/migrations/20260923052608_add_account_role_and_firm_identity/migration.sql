-- CreateEnum
CREATE TYPE "AccountRole" AS ENUM ('PLATFORM_OWNER', 'FIRM_ADMIN', 'FIRM_TEAM', 'FIRM_CLIENT');

-- AlterEnum
ALTER TYPE "StorageProvider" ADD VALUE 'LOCAL';

-- AlterTable
ALTER TABLE "Firm" ADD COLUMN     "createdByPlatformAdminId" TEXT,
ADD COLUMN     "domain" TEXT,
ADD COLUMN     "einLast4" TEXT,
ADD COLUMN     "identityHash" TEXT,
ADD COLUMN     "licenseNumber" TEXT,
ADD COLUMN     "licenseType" TEXT,
ADD COLUMN     "ownerSsnEncrypted" TEXT,
ADD COLUMN     "ownerSsnLast4" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "isPlatformAdmin",
ADD COLUMN     "accountRole" "AccountRole" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Firm_identityHash_key" ON "Firm"("identityHash");

-- CreateIndex
CREATE INDEX "User_accountRole_idx" ON "User"("accountRole");

-- AddForeignKey
ALTER TABLE "Firm" ADD CONSTRAINT "Firm_createdByPlatformAdminId_fkey" FOREIGN KEY ("createdByPlatformAdminId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

