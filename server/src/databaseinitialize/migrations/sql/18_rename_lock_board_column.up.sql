ALTER TABLE boards ALTER COLUMN allow_editing SET DEFAULT FALSE;
ALTER TABLE boards RENAME COLUMN allow_editing TO is_locked;
