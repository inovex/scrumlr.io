CREATE TABLE IF NOT EXISTS deleted_boards(
    id uuid not null primary key,
    access_policy varchar(64),
    total_columns int, 
    hidden_columns int,
    total_notes int,
    hidden_notes int,
    total_users int,
    total_votes int, 
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
        total_users int;
        total_votes int;

        BEGIN 
            -- Retrieve all needed stats
            SELECT count(id) INTO total_columns FROM columns WHERE board = OLD.id;
            SELECT count(id) INTO total_notes FROM notes WHERE board = OLD.id;
            SELECT count(user) INTO total_users FROM board_sessions WHERE board = OLD.id;
            SELECT count(board) INTO total_votes FROM votes WHERE board = OLD.id;

            SELECT count(n.id) INTO hidden_notes FROM notes n INNER JOIN columns c ON n."column" = c.id WHERE c."visible" = false AND n."board" = OLD.id;
            SELECT count(id) INTO hidden_columns FROM columns c WHERE board = OLD.id AND c."visible" = false;

            --  Insert data
            INSERT INTO deleted_boards (id, access_policy, total_columns, hidden_columns, total_notes, hidden_notes, total_users, total_votes, created_at) 
                VALUES (OLD.id, OLD.access_policy, total_columns, hidden_columns, total_notes, hidden_notes, total_users, total_votes, OLD.created_at);
            RETURN OLD;
        END;
    $$ LANGUAGE plpgsql;

CREATE TRIGGER before_delete_board
    BEFORE DELETE ON boards
    FOR EACH ROW
    EXECUTE FUNCTION record_deleted_board_statistics();