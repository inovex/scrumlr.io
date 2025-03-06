create table assignments
(
    id       uuid default gen_random_uuid() not null primary key,
    "board"  uuid not null references boards ON DELETE CASCADE,
    "note"   uuid not null references notes ON DELETE CASCADE,
    name    varchar(64) not null
);
