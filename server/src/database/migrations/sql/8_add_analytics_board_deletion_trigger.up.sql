CREATE TABLE IF NOT EXISTS deleted_boards(
    id uuid not null primary key,
    access_policy access_policy,
    total_columns int, 
    hidden_columns int,
    total_notes int,
    hidden_notes int,
    first_note_created timestamptz,
    last_note_created timestamptz,
    avg_chars_per_note int,
    total_users int,
    total_admins int,
    total_votes int, 
    total_votings int, 
    created_at timestamptz,
    deleted_at timestamptz default now()
);

CREATE OR REPLACE FUNCTION record_deleted_board_statistics()
    RETURNS TRIGGER AS $$
    DECLARE 
        total_columns int;
        hidden_columns int;
        total_notes int;
        hidden_notes int;
        first_note_created timestamptz;
        last_note_created timestamptz;
        avg_chars_per_note int;
        total_users int;
        total_admins int;
        total_votes int;
        total_votings int;

        BEGIN 
            -- Retrieve all needed stats
            SELECT count(id) INTO total_columns FROM columns WHERE board = OLD.id;
            SELECT count(id) INTO hidden_columns FROM columns c WHERE board = OLD.id AND c."visible" = false;

            SELECT count(id) INTO total_notes FROM notes WHERE board = OLD.id;
            SELECT count(n.id) INTO hidden_notes FROM notes n INNER JOIN columns c ON n."column" = c.id WHERE c."visible" = false AND n."board" = OLD.id;
            SELECT created_at INTO first_note_created FROM notes WHERE board = OLD.id ORDER BY created_at LIMIT 1;
            SELECT created_at INTO last_note_created FROM notes WHERE board = OLD.id ORDER BY created_at DESC LIMIT 1;
            SELECT AVG(LENGTH(text)) INTO avg_chars_per_note FROM notes WHERE board = OLD.id;

            SELECT count(user) INTO total_users FROM board_sessions WHERE board = OLD.id;
            SELECT count(user) INTO total_admins FROM board_sessions s WHERE s.board = OLD.id AND s.role = 'OWNER' OR s.role = 'MODERATOR';

            SELECT count(board) INTO total_votes FROM votes WHERE board = OLD.id;
            SELECT count(id) INTO total_votings FROM votings WHERE board = OLD.id;

            --  Insert data
            INSERT INTO deleted_boards (id, access_policy, total_columns, hidden_columns, total_notes, hidden_notes, avg_chars_per_note, first_note_created, last_note_created, total_users, total_admins, total_votes, total_votings, created_at) 
                VALUES (OLD.id, OLD.access_policy, total_columns, hidden_columns, total_notes, hidden_notes, avg_chars_per_note, first_note_created, last_note_created, total_users, total_admins, total_votes, total_votings, OLD.created_at);
            RETURN OLD;
        END;
    $$ LANGUAGE plpgsql;

CREATE TRIGGER before_delete_board
    BEFORE DELETE ON boards
    FOR EACH ROW
    EXECUTE FUNCTION record_deleted_board_statistics();
    