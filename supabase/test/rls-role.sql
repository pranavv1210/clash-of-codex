do $$ begin if not exists(select 1 from pg_roles where rolname='coc_tenant') then create role coc_tenant nologin; end if; end $$;
grant usage on schema public to coc_tenant;
grant select,insert,update,delete on users,github_accounts,repositories,sessions to coc_tenant;
