-- Drop constraints first (though DROP TABLE would handle this automatically)
ALTER TABLE IF EXISTS drag_locks DROP CONSTRAINT IF EXISTS fk_drag_locks_note_id;
ALTER TABLE IF EXISTS drag_locks DROP CONSTRAINT IF EXISTS fk_drag_locks_user_id;
ALTER TABLE IF EXISTS drag_locks DROP CONSTRAINT IF EXISTS fk_drag_locks_board_id;

DROP INDEX IF EXISTS idx_drag_locks_board_id;
DROP TABLE IF EXISTS drag_locks;