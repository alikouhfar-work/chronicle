-- Delete means delete (product decision D4): comments no longer keep a
-- soft-deleted tombstone. Rows already marked deleted are purged here so the
-- column can be dropped; their storage objects are picked up by the attachment
-- sweep after the fact.

DELETE FROM "comments" WHERE "deleted_at" IS NOT NULL;

ALTER TABLE "comments" DROP COLUMN "deleted_at";
