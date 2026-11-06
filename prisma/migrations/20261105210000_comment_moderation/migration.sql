-- Moderation: readers can report a review, and a report can hide it.
-- Additive: two nullable columns on `comments`, one new enum and one new table.

-- CreateEnum
CREATE TYPE "CommentReportReason" AS ENUM ('spam', 'abuse', 'off_topic', 'other');

-- AlterTable
ALTER TABLE "comments" ADD COLUMN     "hidden_at" TIMESTAMPTZ(3),
ADD COLUMN     "hidden_reason" TEXT;

-- CreateTable
CREATE TABLE "comment_reports" (
    "id" TEXT NOT NULL,
    "comment_id" TEXT NOT NULL,
    "reporter_id" TEXT NOT NULL,
    "reason" "CommentReportReason" NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMPTZ(3),

    CONSTRAINT "comment_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "comment_reports_resolved_at_created_at_idx" ON "comment_reports"("resolved_at", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "comment_reports_comment_id_reporter_id_key" ON "comment_reports"("comment_id", "reporter_id");

-- CreateIndex
CREATE INDEX "comments_hidden_at_idx" ON "comments"("hidden_at");

-- AddForeignKey
ALTER TABLE "comment_reports" ADD CONSTRAINT "comment_reports_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment_reports" ADD CONSTRAINT "comment_reports_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
