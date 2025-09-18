CREATE TABLE IF NOT EXISTS drag_locks (
    note_id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    board_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT fk_drag_locks_note_id FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
    CONSTRAINT fk_drag_locks_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_drag_locks_board_id FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE
);

CREATE INDEX idx_drag_locks_board_id ON drag_locks(board_id);