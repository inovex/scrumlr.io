ALTER TABLE boards ADD COLUMN "passphrase_changed_at" timestamptz NULL;

-- sessions that already exist on passphrase protected boards start their 7 day validity now
UPDATE board_sessions SET passphrase_verified_at = now()
WHERE board IN (SELECT id FROM boards WHERE access_policy = 'BY_PASSPHRASE');
