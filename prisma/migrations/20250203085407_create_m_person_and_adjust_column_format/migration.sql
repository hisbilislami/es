/*
  Warnings:

  - You are about to drop the column `createdAt` on the `m_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `expirationDate` on the `m_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `m_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `m_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `m_users` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `m_users` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `m_users` table. All the data in the column will be lost.
  - Added the required column `expiration_date` to the `m_sessions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `m_sessions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `m_sessions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `person_id` to the `m_users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `m_users` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "m_sessions" DROP CONSTRAINT "m_sessions_userId_fkey";

-- DropIndex
DROP INDEX "m_sessions_userId_idx";

-- DropIndex
DROP INDEX "m_users_name_email_idx";

-- AlterTable
ALTER TABLE "m_sessions" DROP COLUMN "createdAt",
DROP COLUMN "expirationDate",
DROP COLUMN "updatedAt",
DROP COLUMN "userId",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "expiration_date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "user_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "m_users" DROP COLUMN "createdAt",
DROP COLUMN "name",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "person_id" INTEGER NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "m_persons" (
    "id" SERIAL NOT NULL,
    "nik" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "sign" TEXT,
    "practitioner_number" TEXT,
    "medical_record_number" TEXT,
    "tenant_id" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "m_persons_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "m_persons_nik_key" ON "m_persons"("nik");

-- CreateIndex
CREATE INDEX "m_persons_nik_idx" ON "m_persons"("nik");

-- CreateIndex
CREATE INDEX "m_sessions_user_id_idx" ON "m_sessions"("user_id");

-- CreateIndex
CREATE INDEX "m_users_email_person_id_idx" ON "m_users"("email", "person_id");

-- AddForeignKey
ALTER TABLE "m_users" ADD CONSTRAINT "m_users_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "m_persons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "m_sessions" ADD CONSTRAINT "m_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "m_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
