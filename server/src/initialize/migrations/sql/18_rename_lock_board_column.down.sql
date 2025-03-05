ALTER TABLE boards ALTER COLUMN is_locked SET DEFAULT TRUE;
ALTER TABLE boards RENAME COLUMN is_locked TO allow_editing;
