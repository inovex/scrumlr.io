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
UPDATE boards SET columns_order=array_append(boards.columns_order, (SElECT id FROM insert_column)) WHERE id=(SELECT board FROM insert_column);

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
WITH insert_note AS (
  INSERT INTO notes (author, board, "column", text) VALUES ('b2459d9e-daad-433b-b323-eb834debea55', 'faa7a927-23e3-4072-b75c-8843a3a3fcd4', '4e4f730a-3af6-4fe4-afc6-431963abf0e0', 'TestPaste') RETURNING *
)
UPDATE columns AS c SET notes_order=array_append(c.notes_order, (SELECT id FROM insert_note)) WHERE id=(SELECT "column" FROM insert_note) AND board=(SELECT board FROM insert_note);

-- INSERT NOTE WITHIN STACK
WITH insert_note AS (
  INSERT INTO notes (author, board, "column", stack, text) VALUES ('b2459d9e-daad-433b-b323-eb834debea55', 'faa7a927-23e3-4072-b75c-8843a3a3fcd4', '4e4f730a-3af6-4fe4-afc6-431963abf0e0', 'd7e13a47-d9a7-46bb-b646-96391b080e15', 'TestPasteStack') RETURNING *
)
UPDATE notes AS n SET stack_order=array_append(n.stack_order, (SELECT id FROM insert_note)) WHERE id=(SELECT stack FROM insert_note);

-- MOVE NOTE WITHIN COLUMN
BEGIN;
UPDATE columns SET notes_order=array_remove(columns.notes_order, '${note_id}') WHERE id='${column_id}';
UPDATE columns AS c SET notes_order=c.notes_order[:1]||'${note_id}'||c.notes_order[2:] WHERE c.id='${column_id}';
COMMIT;

-- MOVE NOTE TO ANOTHER COLUMN
BEGIN;
UPDATE columns SET notes_order=array_remove(columns.notes_order, '${note_id}') WHERE id='${old_column_id}';
UPDATE columns AS c SET notes_order=c.notes_order[:1]||'${note_id}'||c.notes_order[2:] WHERE c.id='${new_column_id}';
COMMIT;

-- MOVE NOTE TO STACK
-- TODO

-- MOVE NOTE WITHIN STACK
BEGIN;
UPDATE notes SET stack_order=array_remove(notes.stack_order, '${note_id}') WHERE id='${stack_parent_id}';
UPDATE notes AS n SET stack_order=n.stack_order[:1]||'${note_id}'||n.stack_order[2:] WHERE n.id='${stack_parent_id}';
COMMIT;

-- CALCULATE NEW ORDER BY VOTING
-- TODO



