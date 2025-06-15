-- CreateEnum
CREATE TYPE "ClientPortalRole" AS ENUM ('VIEWER', 'COLLABORATOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "CommentType" AS ENUM ('GENERAL', 'TECHNICAL_FEEDBACK', 'CULTURAL_FIT', 'INTERVIEW_FEEDBACK', 'ASSESSMENT_REVIEW', 'NEXT_STEPS');

-- CreateEnum
CREATE TYPE "InterviewPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "InterviewRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'SCHEDULED', 'COMPLETED', 'CANCELLED', 'REJECTED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('INFO', 'SUCCESS', 'WARNING', 'ERROR', 'ACTION_REQUIRED');

-- CreateEnum
CREATE TYPE "CompetenceFileStatus" AS ENUM ('DRAFT', 'GENERATED', 'ARCHIVED', 'FAILED');

-- AlterEnum
ALTER TYPE "AssessmentStatus" ADD VALUE 'PENDING';

-- AlterTable
ALTER TABLE "candidates" ADD COLUMN     "clientRating" INTEGER,
ADD COLUMN     "clientVisible" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "collaborationNotes" TEXT,
ADD COLUMN     "competenceFileType" TEXT,
ADD COLUMN     "competenceFileUploadedAt" TIMESTAMP(3),
ADD COLUMN     "competenceFileUrl" TEXT,
ADD COLUMN     "shareWithClient" TIMESTAMP(3),
ADD COLUMN     "videoDescription" TEXT,
ADD COLUMN     "videoDuration" INTEGER,
ADD COLUMN     "videoThumbnailUrl" TEXT,
ADD COLUMN     "videoTitle" TEXT,
ADD COLUMN     "videoUploadedAt" TIMESTAMP(3),
ADD COLUMN     "videoUrl" TEXT;

-- CreateTable
CREATE TABLE "client_portal_invitations" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "ClientPortalRole" NOT NULL DEFAULT 'VIEWER',
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "invitedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_portal_invitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_comments" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "authorEmail" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" "CommentType" NOT NULL DEFAULT 'GENERAL',
    "rating" INTEGER,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "requiresResponse" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_comment_responses" (
    "id" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_comment_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_assessment_requirements" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "jobId" TEXT,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "duration" INTEGER,
    "passingScore" INTEGER,
    "instructions" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_assessment_requirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidate_assessments" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "requirementId" TEXT,
    "type" TEXT NOT NULL,
    "status" "AssessmentStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "score" INTEGER,
    "maxScore" INTEGER,
    "notes" TEXT,
    "assessorId" TEXT,
    "reviewedByClient" BOOLEAN NOT NULL DEFAULT false,
    "clientFeedback" TEXT,
    "completedAt" TIMESTAMP(3),
    "dueDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "candidate_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interview_requests" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "requestedBy" TEXT NOT NULL,
    "interviewType" TEXT NOT NULL,
    "preferredDates" TEXT NOT NULL,
    "notes" TEXT,
    "priority" "InterviewPriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "InterviewRequestStatus" NOT NULL DEFAULT 'PENDING',
    "scheduledDate" TIMESTAMP(3),
    "interviewLink" TEXT,
    "interviewerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interview_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_activities" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "actorEmail" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "client_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pipeline_stages" (
    "id" TEXT NOT NULL,
    "clientId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#6B7280',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "requiresClientAction" BOOLEAN NOT NULL DEFAULT false,
    "autoAdvance" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pipeline_stages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_notifications" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "recipientEmail" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL DEFAULT 'INFO',
    "relatedResource" TEXT,
    "actionUrl" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "client_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "industry" TEXT,
    "contactPerson" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "logoUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "industry" TEXT,
    "features" TEXT[],
    "colorScheme" JSONB NOT NULL,
    "styleConfig" JSONB NOT NULL,
    "sections" JSONB NOT NULL,
    "sampleContent" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,

    CONSTRAINT "job_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "competence_file_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "industry" TEXT,
    "features" TEXT[],
    "colorScheme" JSONB NOT NULL,
    "styleConfig" JSONB NOT NULL,
    "sections" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,

    CONSTRAINT "competence_file_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "competence_files" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "templateId" TEXT,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "downloadUrl" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "fileSize" INTEGER,
    "status" "CompetenceFileStatus" NOT NULL DEFAULT 'GENERATED',
    "version" INTEGER NOT NULL DEFAULT 1,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "isAnonymized" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "styleConfig" JSONB,
    "sectionsConfig" JSONB,
    "logoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "generatedBy" TEXT,

    CONSTRAINT "competence_files_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "client_portal_invitations_token_key" ON "client_portal_invitations"("token");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "client_portal_invitations" ADD CONSTRAINT "client_portal_invitations_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_portal_invitations" ADD CONSTRAINT "client_portal_invitations_invitedBy_fkey" FOREIGN KEY ("invitedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_comments" ADD CONSTRAINT "client_comments_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_comments" ADD CONSTRAINT "client_comments_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_comments" ADD CONSTRAINT "client_comments_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_comment_responses" ADD CONSTRAINT "client_comment_responses_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "client_comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_comment_responses" ADD CONSTRAINT "client_comment_responses_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_assessment_requirements" ADD CONSTRAINT "client_assessment_requirements_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_assessment_requirements" ADD CONSTRAINT "client_assessment_requirements_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_assessments" ADD CONSTRAINT "candidate_assessments_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_assessments" ADD CONSTRAINT "candidate_assessments_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_assessments" ADD CONSTRAINT "candidate_assessments_requirementId_fkey" FOREIGN KEY ("requirementId") REFERENCES "client_assessment_requirements"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_assessments" ADD CONSTRAINT "candidate_assessments_assessorId_fkey" FOREIGN KEY ("assessorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_requests" ADD CONSTRAINT "interview_requests_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_requests" ADD CONSTRAINT "interview_requests_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_requests" ADD CONSTRAINT "interview_requests_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_requests" ADD CONSTRAINT "interview_requests_interviewerId_fkey" FOREIGN KEY ("interviewerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_activities" ADD CONSTRAINT "client_activities_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pipeline_stages" ADD CONSTRAINT "pipeline_stages_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_notifications" ADD CONSTRAINT "client_notifications_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competence_files" ADD CONSTRAINT "competence_files_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competence_files" ADD CONSTRAINT "competence_files_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "competence_file_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;
