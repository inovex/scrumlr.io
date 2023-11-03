DROP TABLE IF EXISTS deleted_boards;
DROP TRIGGER IF EXISTS before_delete_board ON boards;
DROP FUNCTION IF EXISTS record_deleted_board_statistics();