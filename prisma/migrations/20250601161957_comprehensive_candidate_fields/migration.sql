/*
  Warnings:

  - You are about to drop the column `experience` on the `candidates` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `candidates` table. All the data in the column will be lost.
  - You are about to drop the column `skills` on the `candidates` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `candidates` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[profileToken]` on the table `candidates` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `fullName` to the `candidates` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastUpdated` to the `candidates` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'CLOSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "Language" AS ENUM ('EN', 'ES', 'FR', 'DE', 'PT', 'IT', 'NL', 'PL', 'RU', 'ZH', 'JA', 'KO');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'REVIEWING', 'INTERVIEW_SCHEDULED', 'INTERVIEWED', 'OFFER_EXTENDED', 'HIRED', 'REJECTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "InterviewType" AS ENUM ('PHONE_SCREENING', 'TECHNICAL', 'BEHAVIORAL', 'FINAL', 'VIDEO_ONE_WAY');

-- CreateEnum
CREATE TYPE "InterviewStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED');

-- CreateEnum
CREATE TYPE "LogLevel" AS ENUM ('INFO', 'WARN', 'ERROR', 'DEBUG');

-- CreateEnum
CREATE TYPE "CandidateStatus" AS ENUM ('NEW', 'ACTIVE', 'PASSIVE', 'DO_NOT_CONTACT', 'BLACKLISTED');

-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'FREELANCE', 'INTERNSHIP', 'TEMPORARY');

-- CreateEnum
CREATE TYPE "NoticePeriod" AS ENUM ('IMMEDIATE', 'ONE_WEEK', 'TWO_WEEKS', 'ONE_MONTH', 'TWO_MONTHS', 'THREE_MONTHS', 'SIX_MONTHS', 'OTHER');

-- CreateEnum
CREATE TYPE "SalaryType" AS ENUM ('ANNUAL', 'MONTHLY', 'DAILY', 'HOURLY');

-- CreateEnum
CREATE TYPE "EducationLevel" AS ENUM ('HIGH_SCHOOL', 'ASSOCIATE', 'BACHELOR', 'MASTER', 'PHD', 'CERTIFICATION', 'BOOTCAMP', 'SELF_TAUGHT');

-- CreateEnum
CREATE TYPE "ReferralStatus" AS ENUM ('PENDING', 'APPROVED', 'PAID', 'REJECTED');

-- CreateEnum
CREATE TYPE "AssessmentType" AS ENUM ('TECHNICAL', 'PERSONALITY', 'COGNITIVE', 'SKILLS_BASED', 'CUSTOM');

-- CreateEnum
CREATE TYPE "AssessmentStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CalendarProvider" AS ENUM ('GOOGLE', 'OUTLOOK', 'APPLE');

-- CreateEnum
CREATE TYPE "SmsStatus" AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'FAILED', 'REPLIED');

-- CreateEnum
CREATE TYPE "SmsDirection" AS ENUM ('OUTBOUND', 'INBOUND');

-- CreateEnum
CREATE TYPE "DistributionStatus" AS ENUM ('PENDING', 'POSTED', 'FAILED', 'EXPIRED', 'REMOVED');

-- CreateEnum
CREATE TYPE "SocialPlatform" AS ENUM ('LINKEDIN', 'TWITTER', 'FACEBOOK', 'INSTAGRAM');

-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'PUBLISHED', 'FAILED');

-- CreateEnum
CREATE TYPE "SeniorityLevel" AS ENUM ('INTERN', 'JUNIOR', 'MID_LEVEL', 'SENIOR', 'LEAD', 'PRINCIPAL', 'ARCHITECT', 'DIRECTOR', 'VP', 'C_LEVEL');

-- CreateEnum
CREATE TYPE "ConsultantType" AS ENUM ('INTERNAL', 'EXTERNAL', 'FREELANCE');

-- CreateEnum
CREATE TYPE "ContractType" AS ENUM ('PERMANENT', 'FREELANCE', 'FIXED_TERM', 'CONTRACT', 'INTERNSHIP');

-- CreateEnum
CREATE TYPE "RemotePreference" AS ENUM ('REMOTE', 'HYBRID', 'ONSITE', 'FLEXIBLE');

-- CreateEnum
CREATE TYPE "ConversionStatus" AS ENUM ('IN_PIPELINE', 'PLACED', 'REJECTED', 'WITHDRAWN', 'ON_HOLD');

-- CreateEnum
CREATE TYPE "WorkAuthStatus" AS ENUM ('CITIZEN', 'PERMANENT_RESIDENT', 'WORK_VISA', 'STUDENT_VISA', 'REQUIRES_SPONSORSHIP', 'NOT_AUTHORIZED');

-- CreateEnum
CREATE TYPE "TravelWillingness" AS ENUM ('NONE', 'OCCASIONAL', 'FREQUENT', 'EXTENSIVE', 'INTERNATIONAL');

-- CreateEnum
CREATE TYPE "WorkSchedule" AS ENUM ('FULL_TIME', 'PART_TIME', 'FLEXIBLE', 'SHIFT_WORK', 'COMPRESSED', 'JOB_SHARE');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "DataSource" AS ENUM ('MANUAL', 'LINKEDIN', 'INDEED', 'GLASSDOOR', 'REFERRAL', 'WEBSITE', 'API_IMPORT', 'BULK_UPLOAD', 'AI_SOURCED');

-- AlterTable
ALTER TABLE "candidates" DROP COLUMN "experience",
DROP COLUMN "name",
DROP COLUMN "skills",
DROP COLUMN "updatedAt",
ADD COLUMN     "archived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "availableFrom" TIMESTAMP(3),
ADD COLUMN     "certifications" TEXT[],
ADD COLUMN     "companies" JSONB,
ADD COLUMN     "consultantType" "ConsultantType",
ADD COLUMN     "conversionStatus" "ConversionStatus",
ADD COLUMN     "culturalFitScore" DOUBLE PRECISION,
ADD COLUMN     "currentLocation" TEXT,
ADD COLUMN     "currentTitle" TEXT,
ADD COLUMN     "degrees" TEXT[],
ADD COLUMN     "educationLevel" "EducationLevel",
ADD COLUMN     "expectedSalary" TEXT,
ADD COLUMN     "experienceYears" INTEGER,
ADD COLUMN     "frameworks" TEXT[],
ADD COLUMN     "freelancer" BOOLEAN DEFAULT false,
ADD COLUMN     "fullName" TEXT NOT NULL,
ADD COLUMN     "functionalDomain" TEXT,
ADD COLUMN     "githubUrl" TEXT,
ADD COLUMN     "graduationYear" INTEGER,
ADD COLUMN     "interviewScores" JSONB,
ADD COLUMN     "lastUpdated" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "linkedinUrl" TEXT,
ADD COLUMN     "managementExperience" BOOLEAN DEFAULT false,
ADD COLUMN     "matchingScore" DOUBLE PRECISION,
ADD COLUMN     "methodologies" TEXT[],
ADD COLUMN     "motivationalFitNotes" TEXT,
ADD COLUMN     "nationality" TEXT,
ADD COLUMN     "notableProjects" TEXT[],
ADD COLUMN     "ongoingTraining" TEXT[],
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "portfolioUrl" TEXT,
ADD COLUMN     "preferredContractType" "ContractType",
ADD COLUMN     "primaryIndustry" TEXT,
ADD COLUMN     "professionalHeadline" TEXT,
ADD COLUMN     "profileToken" TEXT,
ADD COLUMN     "programmingLanguages" TEXT[],
ADD COLUMN     "recruiterNotes" TEXT[],
ADD COLUMN     "referees" JSONB,
ADD COLUMN     "relocationWillingness" BOOLEAN DEFAULT false,
ADD COLUMN     "remotePreference" "RemotePreference",
ADD COLUMN     "seniorityLevel" "SeniorityLevel",
ADD COLUMN     "softSkills" TEXT[],
ADD COLUMN     "source" TEXT,
ADD COLUMN     "spokenLanguages" TEXT[],
ADD COLUMN     "status" "CandidateStatus" NOT NULL DEFAULT 'NEW',
ADD COLUMN     "summary" TEXT,
ADD COLUMN     "tags" TEXT[],
ADD COLUMN     "technicalSkills" TEXT[],
ADD COLUMN     "timezone" TEXT,
ADD COLUMN     "toolsAndPlatforms" TEXT[],
ADD COLUMN     "universities" TEXT[],
ADD COLUMN     "videoInterviewUrl" TEXT,
ADD COLUMN     "workPermitType" TEXT;

-- CreateTable
CREATE TABLE "jobs" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "language" "Language" NOT NULL DEFAULT 'EN',
    "status" "JobStatus" NOT NULL DEFAULT 'DRAFT',
    "salaryMin" DOUBLE PRECISION,
    "salaryMax" DOUBLE PRECISION,
    "salaryCurrency" TEXT DEFAULT 'USD',
    "experienceLevel" TEXT,
    "employmentType" "EmploymentType"[],
    "benefits" TEXT[],
    "requirements" TEXT[],
    "responsibilities" TEXT[],
    "isRemote" BOOLEAN NOT NULL DEFAULT false,
    "publicToken" TEXT,
    "embedCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applications" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "coverLetter" TEXT,
    "cvUrl" TEXT,
    "referralCode" TEXT,
    "source" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referrals" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "referrerId" TEXT NOT NULL,
    "referrerName" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "reward" DOUBLE PRECISION,
    "status" "ReferralStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "referrals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evaluations" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "evaluatorId" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "criteria" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "evaluations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interviews" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "interviewerId" TEXT NOT NULL,
    "type" "InterviewType" NOT NULL,
    "status" "InterviewStatus" NOT NULL DEFAULT 'SCHEDULED',
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL,
    "location" TEXT,
    "videoInterviewUrl" TEXT,
    "notes" TEXT,
    "rating" DOUBLE PRECISION,
    "calendarEventId" TEXT,
    "meetingLink" TEXT,
    "dialInDetails" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessments" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "type" "AssessmentType" NOT NULL,
    "questions" JSONB NOT NULL,
    "answers" JSONB,
    "score" DOUBLE PRECISION,
    "maxScore" DOUBLE PRECISION NOT NULL,
    "status" "AssessmentStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calendar_integrations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" "CalendarProvider" NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT,
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "calendar_integrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sms_messages" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "SmsStatus" NOT NULL DEFAULT 'PENDING',
    "direction" "SmsDirection" NOT NULL,
    "externalId" TEXT,
    "errorCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sms_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_rules" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "trigger" TEXT NOT NULL,
    "conditions" JSONB NOT NULL,
    "actions" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workflow_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_distributions" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "status" "DistributionStatus" NOT NULL,
    "externalId" TEXT,
    "postUrl" TEXT,
    "cost" DOUBLE PRECISION,
    "postedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_distributions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "social_media_posts" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "platform" "SocialPlatform" NOT NULL,
    "content" TEXT NOT NULL,
    "status" "PostStatus" NOT NULL,
    "postUrl" TEXT,
    "postId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "social_media_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_matches" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "reasoning" TEXT,
    "factors" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logs" (
    "id" TEXT NOT NULL,
    "actor" TEXT,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "details" JSONB,
    "level" "LogLevel" NOT NULL DEFAULT 'INFO',
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "jobs_publicToken_key" ON "jobs"("publicToken");

-- CreateIndex
CREATE UNIQUE INDEX "applications_candidateId_jobId_key" ON "applications"("candidateId", "jobId");

-- CreateIndex
CREATE UNIQUE INDEX "referrals_code_key" ON "referrals"("code");

-- CreateIndex
CREATE UNIQUE INDEX "calendar_integrations_userId_key" ON "calendar_integrations"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ai_matches_jobId_candidateId_key" ON "ai_matches"("jobId", "candidateId");

-- CreateIndex
CREATE UNIQUE INDEX "candidates_profileToken_key" ON "candidates"("profileToken");

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interviews" ADD CONSTRAINT "interviews_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interviews" ADD CONSTRAINT "interviews_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sms_messages" ADD CONSTRAINT "sms_messages_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_distributions" ADD CONSTRAINT "job_distributions_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "social_media_posts" ADD CONSTRAINT "social_media_posts_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_matches" ADD CONSTRAINT "ai_matches_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_matches" ADD CONSTRAINT "ai_matches_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;
