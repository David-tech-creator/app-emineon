-- AlterTable
ALTER TABLE "jobs" ADD COLUMN     "pipelineStages" TEXT[],
ADD COLUMN     "slaDays" INTEGER DEFAULT 10,
ADD COLUMN     "slaDeadline" TIMESTAMP(3);
