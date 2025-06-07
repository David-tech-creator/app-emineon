/*
  Warnings:

  - You are about to drop the column `consultantType` on the `candidates` table. All the data in the column will be lost.
  - You are about to drop the column `managementExperience` on the `candidates` table. All the data in the column will be lost.
  - You are about to drop the column `ongoingTraining` on the `candidates` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "candidates" DROP COLUMN "consultantType",
DROP COLUMN "managementExperience",
DROP COLUMN "ongoingTraining";

-- DropEnum
DROP TYPE "ConsultantType";
