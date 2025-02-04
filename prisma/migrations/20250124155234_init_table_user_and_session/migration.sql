-- CreateTable
CREATE TABLE "m_users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "m_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "m_sessions" (
    "id" SERIAL NOT NULL,
    "expirationDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "m_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "m_users_email_key" ON "m_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "m_users_username_key" ON "m_users"("username");

-- CreateIndex
CREATE INDEX "m_users_name_email_idx" ON "m_users"("name", "email");

-- CreateIndex
CREATE UNIQUE INDEX "m_users_email_username_key" ON "m_users"("email", "username");

-- CreateIndex
CREATE INDEX "m_sessions_userId_idx" ON "m_sessions"("userId");

-- AddForeignKey
ALTER TABLE "m_sessions" ADD CONSTRAINT "m_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "m_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
