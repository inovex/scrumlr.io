-- Temporary collection of queries that need to be implemented in order to change the sort order algorithm

-- MIGRATE schema
ALTER TABLE boards ADD columns_order uuid ARRAY;
ALTER TABLE columns ADD notes_order uuid ARRAY;
ALTER TABLE notes ADD stack_order uuid ARRAY;

-- MIGRATE columns
UPDATE boards AS b SET columns_order=(SELECT array_agg(id::uuid ORDER BY index ASC) FROM columns WHERE board=b.id) WHERE id=b.id;

-- MIGRATE notes
UPDATE columns AS c SET notes_order=(SELECT array_agg(id::uuid ORDER BY rank DESC) FROM notes WHERE "column"=c.id AND stack IS null) WHERE id=c.id;

-- MIGRATE stacked notes
UPDATE notes AS n SET stack_order=(SELECT array_agg(id::uuid ORDER BY rank DESC) FROM notes WHERE stack=n.id) WHERE id=n.id;

-- INSERT COLUMN AT THE END
WITH insert_column AS (
  INSERT INTO columns (board,name,color,visible) VALUES ('faa7a927-23e3-4072-b75c-8843a3a3fcd4', 'Test', 'backlog-blue', true) RETURNING *
)
UPDATE boards SET columns_order=array_append(boards.columns_order, (SElECT id FROM insert_column));

-- INSERT COLUMN ANYWHERE
WITH insert_column AS (
  INSERT INTO columns (board,name,color,visible) VALUES ('faa7a927-23e3-4072-b75c-8843a3a3fcd4', 'TestAnywhere', 'backlog-blue', true) RETURNING *
)
UPDATE boards AS b SET columns_order= b.columns_order[:-5]||(SElECT id FROM insert_column)||b.columns_order[-4:];

-- MOVE COLUMN (ATTENTION! CTE does not work here!)
BEGIN;
UPDATE boards SET columns_order=array_remove(boards.columns_order, '4a3ad847-7a30-442d-aa3e-ffc2c628cb3d') WHERE id='faa7a927-23e3-4072-b75c-8843a3a3fcd4';
UPDATE boards AS b SET columns_order=b.columns_order[:1]||'4a3ad847-7a30-442d-aa3e-ffc2c628cb3d'::uuid||b.columns_order[2:] WHERE b.id='faa7a927-23e3-4072-b75c-8843a3a3fcd4';
COMMIT;

-- DELETE COLUMN
WITH delete_column AS (
  DELETE FROM columns WHERE id='bad4acaa-38e4-45f4-9cf8-888b426a9ed5' RETURNING id, board
)
UPDATE boards SET columns_order=array_remove(boards.columns_order, (SELECT id FROM delete_column)) WHERE id=(SELECT board FROM delete_column);




-- INSERT NOTE
-- TODO

-- INSERT NOTE WITHIN STACK
-- TODO

-- MOVE NOTE WITHIN COLUMN
-- TODO

-- MOVE NOTE TO ANOTHER COLUMN
-- TODO

-- MOVE NOTE TO STACK
-- TODO

-- MOVE NOTE WITHIN STACK
-- TODO

-- CALCULATE NEW ORDER BY VOTING
-- TODO



