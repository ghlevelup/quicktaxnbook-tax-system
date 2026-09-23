-- AlterEnum
ALTER TYPE "OtpPurpose" ADD VALUE 'PASSWORD_RESET';

-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "website" TEXT;

