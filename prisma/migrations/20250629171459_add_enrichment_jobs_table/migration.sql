/*
  Warnings:

  - The values [GENERATED,ARCHIVED,FAILED] on the enum `CompetenceFileStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "CompetenceFileStatus_new" AS ENUM ('DRAFT', 'GENERATING', 'READY', 'ERROR');
ALTER TABLE "competence_files" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "competence_files" ALTER COLUMN "status" TYPE "CompetenceFileStatus_new" USING ("status"::text::"CompetenceFileStatus_new");
ALTER TYPE "CompetenceFileStatus" RENAME TO "CompetenceFileStatus_old";
ALTER TYPE "CompetenceFileStatus_new" RENAME TO "CompetenceFileStatus";
DROP TYPE "CompetenceFileStatus_old";
ALTER TABLE "competence_files" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;

-- AlterTable
ALTER TABLE "competence_files" ALTER COLUMN "status" SET DEFAULT 'DRAFT';

-- CreateTable
CREATE TABLE "enrichment_jobs" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "result" JSONB,
    "error" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "maxRetries" INTEGER NOT NULL DEFAULT 3,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "enrichment_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "enrichment_jobs_candidateId_type_idx" ON "enrichment_jobs"("candidateId", "type");

-- CreateIndex
CREATE INDEX "enrichment_jobs_status_idx" ON "enrichment_jobs"("status");

-- AddForeignKey
ALTER TABLE "enrichment_jobs" ADD CONSTRAINT "enrichment_jobs_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;
