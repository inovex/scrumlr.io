CREATE TABLE board_columns
(
  "board"   uuid         NOT NULL REFERENCES boards ON DELETE CASCADE,
  "columns" uuid ARRAY
);

CREATE INDEX board_columns_board_index ON board_columns (board);

-- Migrate previous indices for columns into new array
INSERT INTO board_columns (board, columns) SELECT b.id, array_agg(c.id ORDER BY c.index) FROM boards AS b JOIN columns c ON c.board=b.id GROUP BY b.id;

ALTER TABLE columns DROP COLUMN index;
