ALTER TABLE IF EXISTS notes ADD COLUMN sequence_num int;
ALTER TABLE IF EXISTS notes ADD COLUMN status varchar(128) DEFAULT 'ACTIVE';
