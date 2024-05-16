create type account_type as enum ('ANONYMOUS', 'GOOGLE', 'GITHUB', 'MICROSOFT', 'APPLE', 'AZURE_AD');
create type access_policy as enum ('PUBLIC', 'BY_PASSPHRASE', 'BY_INVITE');
create type board_session_request_status as enum ('PENDING', 'ACCEPTED', 'REJECTED');
create type session_role as enum ('OWNER', 'PARTICIPANT', 'MODERATOR');
create type voting_status as enum ('OPEN', 'ABORTED', 'CLOSED');
create type color as enum ('backlog-blue' , 'grooming-green' , 'lean-lilac' , 'online-orange' , 'planning-pink' , 'poker-purple' , 'retro-red');

create table users
(
  id            uuid        default gen_random_uuid() not null primary key,
  "created_at"  timestamptz default now(),
  name          varchar(64)                           not null,
  account_type  account_type                          not null,
  "avatar"        JSONB,
  key_migration date
);

create table github_users
(
  "user"     uuid        not null references users ON DELETE CASCADE,
  id         varchar(64) not null unique,
  name       varchar(64) not null,
  avatar_url varchar(256)
);

create table google_users
(
  "user"     uuid        not null references users ON DELETE CASCADE,
  id         varchar(64) not null unique,
  name       varchar(64) not null,
  avatar_url varchar(2048)
);

create table microsoft_users
(
  "user"     uuid        not null references users ON DELETE CASCADE,
  id         varchar(64) not null unique,
  name       varchar(64) not null,
  avatar_url varchar(256)
);

create table azure_ad_users
(
  "user"     uuid        not null references users ON DELETE CASCADE,
  id         varchar(64) not null unique,
  name       varchar(64) not null,
  avatar_url varchar(256)
);

create table apple_users
(
  "user"     uuid        not null references users ON DELETE CASCADE,
  id         varchar(64) not null unique,
  name       varchar(64) not null,
  avatar_url varchar(256)
);

create table boards
(
  id                        uuid                   default gen_random_uuid() not null primary key,
  created_at                timestamptz            default now(),
  "name"                    varchar(128),
  description               varchar(300),
  access_policy             access_policy not null DEFAULT 'PUBLIC',
  passphrase                varchar(128),
  salt                      varchar(32),
  show_authors              boolean       not null DEFAULT true,
  show_notes_of_other_users boolean       not null DEFAULT true,
  allow_stacking            boolean       not null DEFAULT true,
  timer_start               timestamptz,
  timer_end                 timestamptz,
  show_note_reactions       boolean       not null DEFAULT true,
  allow_editing             boolean       not null DEFAULT true
);

create table columns
(
  id        uuid                  default gen_random_uuid() not null primary key,
  "board"   uuid         not null references boards ON DELETE CASCADE,
  name      varchar(128) not null,
  check (name <> ''),
  color     color        not null default 'backlog-blue',
  "visible" boolean               DEFAULT false,
  "index"   int          not null DEFAULT 0
);
create index columns_board_index on columns (board);

create table board_session_requests
(
  "user"       uuid                         not null references users ON DELETE CASCADE,
  "board"      uuid                         not null references boards ON DELETE CASCADE,
  "status"     board_session_request_status not null DEFAULT 'PENDING',
  "created_at" timestamptz                  not null DEFAULT now(),
  PRIMARY KEY ("user", board)
);
create index board_session_requests_board_index on board_session_requests (board);

create table board_sessions
(
  "user"                uuid         not null references users ON DELETE CASCADE,
  "board"               uuid         not null references boards ON DELETE CASCADE,
  "show_hidden_columns" boolean      not null DEFAULT true,
  "connected"           boolean      not null DEFAULT false,
  "ready"               boolean      not null DEFAULT false,
  raised_hand           boolean      not null DEFAULT false,
  "role"                session_role not null,
  "created_at"          timestamptz  not null DEFAULT now(),
  banned                boolean      not null DEFAULT false,
  PRIMARY KEY ("user", board)
);
create index board_sessions_board_index on board_sessions (board);

create table notes
(
  id         uuid                   default gen_random_uuid() not null primary key,
  created_at timestamptz   not null DEFAULT now(),
  "author"   uuid          not null references users ON DELETE CASCADE,
  "board"    uuid          not null references boards ON DELETE CASCADE,
  "column"   uuid          not null references columns ON DELETE CASCADE,
  text       varchar(2048) not null,
  check (text <> ''),
  "rank"     int           not null DEFAULT 0
);
create index notes_board_index on notes (board);
create index notes_column_index on notes ("column");

alter table notes
  add "stack" uuid references notes ON DELETE CASCADE;
create index notes_stack_index on notes (stack);

alter table boards
  add shared_note uuid references notes;


create table votings
(
  id                   uuid                   default gen_random_uuid() not null primary key,
  created_at           timestamptz   not null default now(),
  "board"              uuid          not null references boards ON DELETE CASCADE,
  vote_limit           int           not null,
  allow_multiple_votes boolean       not null DEFAULT true,
  show_votes_of_others boolean       not null DEFAULT false,
  "status"             voting_status not null DEFAULT 'OPEN'
);

alter table boards
  add show_voting uuid references votings;


create table votes
(
  "board"  uuid not null references boards ON DELETE CASCADE,
  "voting" uuid not null references votings ON DELETE CASCADE,
  "user"   uuid not null references users ON DELETE CASCADE,
  "note"   uuid not null references notes ON DELETE CASCADE
);

CREATE TABLE reactions
(
  "id"            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "note"          UUID        NOT NULL REFERENCES notes ON DELETE CASCADE,
  "user"          UUID        NOT NULL REFERENCES users ON DELETE CASCADE,
  /* CLDR short name in order to allow custom emojis */
  "reaction_type" VARCHAR(50) NOT NULL
);
create index reactions_note_index on reactions (note);

create table deleted_boards
(
  id uuid not null primary key,
  access_policy access_policy,
  total_columns int,
  hidden_columns int,
  total_notes int,
  hidden_notes int,
  first_note_created timestamptz,
  last_note_created timestamptz,
  avg_chars_per_note int,
  total_participants int,
  total_moderators int,
  total_votes int,
  total_votings int,
  created_at timestamptz,
  deleted_at timestamptz default now()
  );

CREATE FUNCTION record_deleted_board_statistics() RETURNS TRIGGER AS $$
DECLARE
  total_columns int;
  hidden_columns int;
  total_notes int;
  hidden_notes int;
  first_note_created timestamptz;
  last_note_created timestamptz;
  avg_chars_per_note int;
  total_participants int;
  total_moderators int;
  total_votes int;
  total_votings int;

BEGIN
            -- Retrieve all needed stats
SELECT count(id) INTO total_columns FROM columns WHERE board = OLD.id;
SELECT count(id) INTO hidden_columns FROM columns c WHERE board = OLD.id AND c."visible" = false;

SELECT count(id) INTO total_notes FROM notes WHERE board = OLD.id;
SELECT count(n.id) INTO hidden_notes FROM notes n INNER JOIN columns c ON n."column" = c.id
WHERE c."visible" = false AND n."board" = OLD.id;
SELECT min(created_at) INTO first_note_created FROM notes WHERE board = OLD.id;
SELECT max(created_at) INTO last_note_created FROM notes WHERE board = OLD.id;
SELECT AVG(LENGTH(text)) INTO avg_chars_per_note FROM notes WHERE board = OLD.id;

SELECT count(user) INTO total_participants FROM board_sessions s WHERE s.board = OLD.id AND s.role = 'PARTICIPANT';
SELECT count(user) INTO total_moderators FROM board_sessions s WHERE s.board = OLD.id AND s.role = 'OWNER'OR s.role = 'MODERATOR';

SELECT count(board) INTO total_votes FROM votes WHERE board = OLD.id;
SELECT count(id) INTO total_votings FROM votings WHERE board = OLD.id;

--  Insert data
INSERT INTO deleted_boards (id, access_policy, total_columns, hidden_columns, total_notes, hidden_notes,
                            avg_chars_per_note, first_note_created, last_note_created, total_participants,
                            total_moderators, total_votes, total_votings, created_at)
VALUES (OLD.id, OLD.access_policy, total_columns, hidden_columns, total_notes, hidden_notes, avg_chars_per_note,
        first_note_created, last_note_created, total_participants, total_moderators, total_votes, total_votings,
        OLD.created_at);
RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_delete_board
  BEFORE DELETE
  ON boards
  FOR EACH ROW
  EXECUTE FUNCTION record_deleted_board_statistics();

