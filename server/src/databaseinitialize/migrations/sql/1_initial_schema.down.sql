drop type if exists account_type cascade;
drop type if exists access_policy cascade;
drop type if exists board_session_request_status cascade;
drop type if exists session_role cascade;
drop type if exists voting_status cascade;

drop table if exists users cascade;
drop table if exists boards cascade;
drop table if exists "columns" cascade;
drop table if exists board_session_requests cascade;
drop table if exists board_sessions cascade;
drop table if exists notes cascade;
drop table if exists votings cascade;
drop table if exists votes cascade;