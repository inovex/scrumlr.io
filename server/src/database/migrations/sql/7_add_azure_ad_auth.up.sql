alter type account_type add value 'AZURE_AD';

create table azure_ad_users
(
    "user"     uuid        not null references users ON DELETE CASCADE,
    id         varchar(64) not null unique,
    name       varchar(64) not null,
    avatar_url varchar(256)
);
