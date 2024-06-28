create table edited_notes
(
  id         uuid                   default gen_random_uuid() not null primary key,
  created_at timestamptz   not null DEFAULT now(),
  "author"   uuid          not null references users ON DELETE SET NULL,
  "board"    uuid          not null references boards ON DELETE CASCADE,
  "column"   uuid          not null references columns ON DELETE CASCADE,
  text       varchar(2048) not null,
  check (text <> ''),
  "rank"     int           not null DEFAULT 0
);
