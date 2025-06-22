-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED', 'PLANNING');

-- CreateEnum
CREATE TYPE "ProjectUrgency" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "ProjectPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "ProjectActivityType" AS ENUM ('PROJECT_CREATED', 'EMAIL_RECEIVED', 'EMAIL_SENT', 'CANDIDATE_ADDED', 'CANDIDATE_REMOVED', 'JOB_CREATED', 'JOB_FILLED', 'CLIENT_MEETING', 'STATUS_UPDATED', 'DEADLINE_UPDATED', 'BUDGET_UPDATED', 'NOTES_ADDED', 'DOCUMENT_UPLOADED');

-- CreateEnum
CREATE TYPE "ProjectDocType" AS ENUM ('CLIENT_EMAIL', 'JOB_DESCRIPTION', 'CONTRACT', 'PROPOSAL', 'CANDIDATE_CV', 'PRESENTATION', 'MEETING_NOTES', 'OTHER');

-- CreateEnum
CREATE TYPE "ProjectCandidateStatus" AS ENUM ('SOURCED', 'SCREENING', 'SUBMITTED', 'CLIENT_REVIEW', 'INTERVIEWING', 'OFFERED', 'HIRED', 'REJECTED', 'WITHDRAWN');

-- AlterTable
ALTER TABLE "jobs" ADD COLUMN     "projectId" TEXT;

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "clientName" TEXT NOT NULL,
    "clientContact" TEXT,
    "clientEmail" TEXT,
    "clientPhone" TEXT,
    "totalPositions" INTEGER NOT NULL,
    "filledPositions" INTEGER NOT NULL DEFAULT 0,
    "urgencyLevel" "ProjectUrgency" NOT NULL DEFAULT 'MEDIUM',
    "priority" "ProjectPriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "ProjectStatus" NOT NULL DEFAULT 'ACTIVE',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "budgetEndDate" TIMESTAMP(3),
    "budgetRange" TEXT,
    "hourlyRateMin" INTEGER,
    "hourlyRateMax" INTEGER,
    "currency" TEXT DEFAULT 'EUR',
    "location" TEXT,
    "isRemote" BOOLEAN NOT NULL DEFAULT false,
    "isHybrid" BOOLEAN NOT NULL DEFAULT false,
    "skillsRequired" TEXT[],
    "experienceRequired" TEXT[],
    "industryBackground" TEXT,
    "languageRequirements" TEXT[],
    "sourceEmail" TEXT,
    "sourceEmailSubject" TEXT,
    "sourceEmailDate" TIMESTAMP(3),
    "parsedFromEmail" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "assignedRecruiter" TEXT,
    "candidatesSourced" INTEGER NOT NULL DEFAULT 0,
    "candidatesScreened" INTEGER NOT NULL DEFAULT 0,
    "candidatesInterviewed" INTEGER NOT NULL DEFAULT 0,
    "candidatesPresented" INTEGER NOT NULL DEFAULT 0,
    "candidatesHired" INTEGER NOT NULL DEFAULT 0,
    "lastClientUpdate" TIMESTAMP(3),
    "nextFollowUp" TIMESTAMP(3),
    "clientFeedback" TEXT,
    "internalNotes" TEXT[],
    "tags" TEXT[],

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_activities" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "type" "ProjectActivityType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,

    CONSTRAINT "project_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_documents" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ProjectDocType" NOT NULL,
    "url" TEXT NOT NULL,
    "size" INTEGER,
    "mimeType" TEXT,
    "uploadedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_candidates" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "status" "ProjectCandidateStatus" NOT NULL DEFAULT 'SOURCED',
    "notes" TEXT,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "addedBy" TEXT,
    "targetRole" TEXT,
    "fitScore" DOUBLE PRECISION,

    CONSTRAINT "project_candidates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "projects_status_idx" ON "projects"("status");

-- CreateIndex
CREATE INDEX "projects_urgencyLevel_idx" ON "projects"("urgencyLevel");

-- CreateIndex
CREATE INDEX "projects_clientEmail_idx" ON "projects"("clientEmail");

-- CreateIndex
CREATE INDEX "projects_assignedRecruiter_idx" ON "projects"("assignedRecruiter");

-- CreateIndex
CREATE INDEX "projects_endDate_idx" ON "projects"("endDate");

-- CreateIndex
CREATE INDEX "project_activities_projectId_idx" ON "project_activities"("projectId");

-- CreateIndex
CREATE INDEX "project_activities_type_idx" ON "project_activities"("type");

-- CreateIndex
CREATE INDEX "project_activities_createdAt_idx" ON "project_activities"("createdAt");

-- CreateIndex
CREATE INDEX "project_documents_projectId_idx" ON "project_documents"("projectId");

-- CreateIndex
CREATE INDEX "project_documents_type_idx" ON "project_documents"("type");

-- CreateIndex
CREATE INDEX "project_candidates_projectId_idx" ON "project_candidates"("projectId");

-- CreateIndex
CREATE INDEX "project_candidates_candidateId_idx" ON "project_candidates"("candidateId");

-- CreateIndex
CREATE INDEX "project_candidates_status_idx" ON "project_candidates"("status");

-- CreateIndex
CREATE UNIQUE INDEX "project_candidates_projectId_candidateId_key" ON "project_candidates"("projectId", "candidateId");

-- CreateIndex
CREATE INDEX "jobs_projectId_idx" ON "jobs"("projectId");

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_activities" ADD CONSTRAINT "project_activities_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_documents" ADD CONSTRAINT "project_documents_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_candidates" ADD CONSTRAINT "project_candidates_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_candidates" ADD CONSTRAINT "project_candidates_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;
