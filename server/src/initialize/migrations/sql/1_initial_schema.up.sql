create type account_type as enum ('ANONYMOUS', 'GOOGLE', 'GITHUB', 'MICROSOFT', 'APPLE');
create type access_policy as enum ('PUBLIC', 'BY_PASSPHRASE', 'BY_INVITE');
create type board_session_request_status as enum ('PENDING', 'ACCEPTED', 'REJECTED');
create type session_role as enum ('OWNER', 'PARTICIPANT', 'MODERATOR');
create type voting_status as enum ('OPEN', 'ABORTED', 'CLOSED');
create type color as enum ('backlog-blue' , 'grooming-green' , 'lean-lilac' , 'online-orange' , 'planning-pink' , 'poker-purple' , 'retro-red');

create table users
(
    id           uuid        default gen_random_uuid() not null primary key,
    "created_at" timestamptz default now(),
    name         varchar(64)                           not null,
    account_type account_type                          not null
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
    avatar_url varchar(256)
);

create table microsoft_users
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
    access_policy             access_policy not null DEFAULT 'PUBLIC',
    passphrase                varchar(128),
    salt                      varchar(32),
    show_authors              boolean       not null DEFAULT true,
    show_notes_of_other_users boolean       not null DEFAULT true,
    allow_stacking            boolean       not null DEFAULT true,
    timer_end                 timestamptz
);

create table columns
(
    id        uuid                  default gen_random_uuid() not null primary key,
    "board"   uuid         not null references boards ON DELETE CASCADE,
    name      varchar(128) not null,
    check (name <> ''),
    color   color not null default 'backlog-blue',
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
    "user"       uuid         not null references users ON DELETE CASCADE,
    "board"      uuid         not null references boards ON DELETE CASCADE,
    "show_hidden_columns" boolean not null DEFAULT false,
    "connected"  boolean      not null DEFAULT false,
    "ready"      boolean      not null DEFAULT false,
    raised_hand  boolean      not null DEFAULT false,
    "role"       session_role not null,
    "created_at" timestamptz  not null DEFAULT now(),
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
