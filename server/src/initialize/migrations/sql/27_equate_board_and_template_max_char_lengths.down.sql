-- revert to previous max char length values (see migration file 17)
ALTER TABLE IF EXISTS board_templates ALTER COLUMN description TYPE VARCHAR(300);
ALTER TABLE IF EXISTS column_templates ALTER COLUMN description TYPE VARCHAR(128);
