ALTER TABLE boards DROP CONSTRAINT boards_shared_note_fkey;
ALTER TABLE boards ADD FOREIGN KEY (shared_note) REFERENCES notes ON DELETE SET NULL;
