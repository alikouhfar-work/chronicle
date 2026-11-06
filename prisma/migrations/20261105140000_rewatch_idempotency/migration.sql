-- Idempotent rewatch writes: a client mints a request id when the dialog opens
-- and repeats it on retries. The same (user, request id) may only produce one
-- watch, so a timeout retry or a double submit cannot inflate the counters.
--
-- `client_request_id` is nullable and Postgres treats NULLs as distinct in a
-- unique index, so rows without a request id (older clients, internal
-- backfills) are never constrained against each other.

ALTER TABLE "rewatch_logs" ADD COLUMN "client_request_id" text;

CREATE UNIQUE INDEX "rewatch_logs_user_id_client_request_id_key"
  ON "rewatch_logs" ("user_id", "client_request_id");
