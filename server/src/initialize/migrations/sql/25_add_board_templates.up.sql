ALTER TABLE IF EXISTS boards ADD COLUMN last_modified_at timestamptz DEFAULT NOW();
UPDATE boards SET last_modified_at = created_at;
ALTER TABLE boards ALTER COLUMN last_modified_at SET NOT NULL;
