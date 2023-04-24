ALTER TABLE board_sessions
DROP COLUMN IF EXISTS views_shared_note,
DROP COLUMN IF EXISTS moderating;
