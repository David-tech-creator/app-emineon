-- AlterTable
ALTER TABLE "candidates" ADD COLUMN     "originalCvFileName" TEXT,
ADD COLUMN     "originalCvUploadedAt" TIMESTAMP(3),
ADD COLUMN     "originalCvUrl" TEXT;
