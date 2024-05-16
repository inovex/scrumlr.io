drop type if exists account_type cascade;
drop type if exists access_policy cascade;
drop type if exists board_session_request_status cascade;
drop type if exists session_role cascade;
drop type if exists voting_status cascade;

drop table if exists users cascade;
drop table if exists github_users cascade;
drop table if exists google_users cascade;
drop table if exists microsoft_users cascade;
drop table if exists azure_ad_users cascade;
drop table if exists apple_users cascade;
drop table if exists boards cascade;
drop table if exists "columns" cascade;
drop table if exists board_session_requests cascade;
drop table if exists board_sessions cascade;
drop table if exists notes cascade;
drop table if exists votings cascade;
drop table if exists votes cascade;
drop table if exists ractions cascade;
drop table if exists deleted_boards cascade;

DROP FUNCTION record_deleted_board_statistics();

DROP TRIGGER before_delete_board ON boards;
