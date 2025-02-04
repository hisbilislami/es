/*
  Warnings:

  - You are about to alter the column `name` on the `m_persons` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `practitioner_number` on the `m_persons` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `medical_record_number` on the `m_persons` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `email` on the `m_users` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `username` on the `m_users` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.

*/
-- AlterTable
ALTER TABLE "m_persons" ALTER COLUMN "nik" SET DATA TYPE VARCHAR(16),
ALTER COLUMN "name" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "practitioner_number" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "medical_record_number" SET DATA TYPE VARCHAR(50);

-- AlterTable
ALTER TABLE "m_users" ALTER COLUMN "email" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "username" SET DATA TYPE VARCHAR(50);
