-- Execute manually in a dedicated PostgreSQL database before any future live rollout.
-- Unique slot_key is the atomic, durable claim. Do not delete or reset rows on retries.
CREATE TABLE IF NOT EXISTS facebook_publish_ledger (
  slot_key text PRIMARY KEY CHECK (slot_key ~ '^\\d{4}-\\d{2}-\\d{2}-(morning|evening)$'),
  status text NOT NULL CHECK (status IN ('PENDING','PROCESSING','PUBLISHED','FAILED','UNKNOWN')),
  photo_id text,
  post_id text,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);
