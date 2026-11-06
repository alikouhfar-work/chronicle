-- A reversible watch removal: the deleted rows and the counters/tracking values
-- they changed, kept for the undo window. Additive only — no existing table or
-- row is touched, so a rollback is `DROP TABLE rewatch_log_removals`.

-- CreateTable
CREATE TABLE "rewatch_log_removals" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "media_type" "RewatchMediaType" NOT NULL,
    "media_id" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rewatch_log_removals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "rewatch_log_removals_user_id_created_at_idx" ON "rewatch_log_removals"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "rewatch_log_removals_created_at_idx" ON "rewatch_log_removals"("created_at");

-- AddForeignKey
ALTER TABLE "rewatch_log_removals" ADD CONSTRAINT "rewatch_log_removals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
