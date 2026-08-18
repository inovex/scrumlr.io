-- increase max char description lengths of template to match the board
ALTER TABLE IF EXISTS board_templates ALTER COLUMN description TYPE VARCHAR(1024);
ALTER TABLE IF EXISTS column_templates ALTER COLUMN description TYPE VARCHAR(1024);
