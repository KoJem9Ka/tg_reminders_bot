-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CreateEnum
CREATE TYPE "WeekDayEnum" AS ENUM ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday');

-- CreateTable
CREATE TABLE "user" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "telegramId" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reminder" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "userId" UUID NOT NULL,
    "text" TEXT NOT NULL,
    "targetDate" TIMESTAMPTZ NOT NULL,
    "isRepeatEnabled" BOOLEAN NOT NULL DEFAULT false,
    "repeatMs" TEXT,
    "repeatDays" "WeekDayEnum"[] DEFAULT ARRAY[]::"WeekDayEnum"[],
    "nextSendAt" TIMESTAMPTZ NOT NULL,
    "sentAt" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "reminder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "telegraf-sessions" (
    "key" VARCHAR(32) NOT NULL,
    "session" TEXT,

    CONSTRAINT "telegraf-sessions_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_telegramId_key" ON "user"("telegramId");

-- AddForeignKey
ALTER TABLE "reminder" ADD CONSTRAINT "reminder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
