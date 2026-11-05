-- Attachments gain an explicit object key so the maintenance sweep can match
-- database rows to stored objects without parsing URLs, and so a row can never
-- point at an object this deployment did not write.

ALTER TABLE "comment_attachments" ADD COLUMN "storage_key" text;

-- Existing rows: every URL this app mints ends in `comment-attachments/<name>`.
UPDATE "comment_attachments"
SET "storage_key" = substring("url" FROM 'comment-attachments/[^/]*$')
WHERE "url" LIKE '%comment-attachments/%';

-- Anything unparseable gets a deterministic placeholder; the sweep will treat
-- it as unreferenced and clean it up.
UPDATE "comment_attachments"
SET "storage_key" = 'comment-attachments/legacy-' || "id"
WHERE "storage_key" IS NULL;

ALTER TABLE "comment_attachments" ALTER COLUMN "storage_key" SET NOT NULL;

CREATE UNIQUE INDEX "comment_attachments_storage_key_key"
  ON "comment_attachments" ("storage_key");
