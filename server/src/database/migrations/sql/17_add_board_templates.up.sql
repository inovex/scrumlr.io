create table board_templates
(
    id                        uuid              default gen_random_uuid() not null primary key,
    creator                   uuid              not null references users ON DELETE CASCADE,
    created_at                timestamptz       default now(),
    "name"                    varchar(128),
    description               varchar(300),
    access_policy             access_policy     not null DEFAULT 'PUBLIC'
);

create table column_templates
(
    id                 uuid                  default gen_random_uuid() not null primary key,
    "board_template"   uuid         not null references board_templates ON DELETE CASCADE,
    name               varchar(128) not null,
    check (name <> ''),
    description        varchar(128),
    color              color        not null default 'backlog-blue',
    "visible"          boolean               DEFAULT false,
    "index"            int          not null DEFAULT 0
);
