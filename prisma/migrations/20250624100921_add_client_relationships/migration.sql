-- AlterTable
ALTER TABLE "jobs" ADD COLUMN     "clientId" TEXT;

-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "clientId" TEXT;

-- CreateIndex
CREATE INDEX "jobs_clientId_idx" ON "jobs"("clientId");

-- CreateIndex
CREATE INDEX "projects_clientId_idx" ON "projects"("clientId");

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;
