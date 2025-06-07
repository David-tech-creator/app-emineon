/*
  Warnings:

  - You are about to alter the column `salaryMin` on the `jobs` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `salaryMax` on the `jobs` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - The `employmentType` column on the `jobs` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "jobs" ALTER COLUMN "salaryMin" SET DATA TYPE INTEGER,
ALTER COLUMN "salaryMax" SET DATA TYPE INTEGER,
DROP COLUMN "employmentType",
ADD COLUMN     "employmentType" TEXT[];

-- CreateIndex
CREATE INDEX "jobs_status_publishedAt_idx" ON "jobs"("status", "publishedAt");

-- CreateIndex
CREATE INDEX "jobs_status_isRemote_idx" ON "jobs"("status", "isRemote");

-- CreateIndex
CREATE INDEX "jobs_status_department_idx" ON "jobs"("status", "department");

-- CreateIndex
CREATE INDEX "jobs_status_location_idx" ON "jobs"("status", "location");

-- CreateIndex
CREATE INDEX "jobs_status_language_idx" ON "jobs"("status", "language");

-- CreateIndex
CREATE INDEX "jobs_publishedAt_idx" ON "jobs"("publishedAt");

-- CreateIndex
CREATE INDEX "jobs_expiresAt_idx" ON "jobs"("expiresAt");
