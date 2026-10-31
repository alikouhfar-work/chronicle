-- The original public-reviews migration declared the mention and notification
-- relations in the Prisma schema but did not create their foreign keys. Add
-- them idempotently so databases created from either migration path converge.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'comments_user_id_fkey'
  ) THEN
    ALTER TABLE "comments"
      ADD CONSTRAINT "comments_user_id_fkey"
      FOREIGN KEY ("user_id") REFERENCES "User"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'comment_mentions_mentioned_user_id_fkey'
  ) THEN
    ALTER TABLE "comment_mentions"
      ADD CONSTRAINT "comment_mentions_mentioned_user_id_fkey"
      FOREIGN KEY ("mentioned_user_id") REFERENCES "User"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'notifications_recipient_id_fkey'
  ) THEN
    ALTER TABLE "notifications"
      ADD CONSTRAINT "notifications_recipient_id_fkey"
      FOREIGN KEY ("recipient_id") REFERENCES "User"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'notifications_actor_id_fkey'
  ) THEN
    ALTER TABLE "notifications"
      ADD CONSTRAINT "notifications_actor_id_fkey"
      FOREIGN KEY ("actor_id") REFERENCES "User"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
